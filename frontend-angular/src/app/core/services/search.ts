import { Injectable } from '@angular/core';
import { pipeline, env } from '@xenova/transformers';

/**
 * Contrato estructural para los nodos candidatos.
 * Elimina la dependencia de `any` explícito en los contratos de dominio.
 */
export interface SearchNode {
  nombre: string;
  sinonimos?: string[];
  [key: string]: unknown; // Permite indexación dinámica segura manteniendo el OCP (Open/Closed Principle)
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Se mantiene `any` para el extractor al no poder alterar imports para traer el tipo `Pipeline` de Xenova
  private extractor: any = null;
  
  // Patrón de Control de Concurrencia Asíncrona (Singleton Promise)
  private initializationPromise: Promise<void> | null = null;

  // Optimización de Estructura de Datos: Set tiene complejidad O(1) en búsquedas vs Array O(N)
  private readonly STOPWORDS: ReadonlySet<string> = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", 
    "de", "del", "y", "o", "que", "en", "por", "para", "con",
    "dias", "tardes", "noches", "quiero", "quisiera", "busco",
    "necesito", "me", "das", "tienes", "como", "cuales", "algo"
  ]);

  /**
   * Limpia y normaliza el texto de entrada.
   */
  limpiarTexto(text: string): string {
    if (!text) return "";

    const limpio = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "");

    return limpio
      .split(/\s+/)
      .filter((p: string) => p.length > 2 && !this.STOPWORDS.has(p))
      .join(" ");
  }

  /**
   * Inicializa el modelo IA garantizando concurrencia segura (Thread-safe equivalent en el Event Loop).
   */
  async initModel(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = (async () => {
        Object.assign(env, { allowLocalModels: false });
        
        if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
            Object.assign(env.backends.onnx.wasm, {
                wasmPaths: '/assets/onnx/',
                numThreads: 1 
            });
        }
        
        // Regresamos a la forma original para que TypeScript esté feliz
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        console.log("Cerebro de vectores (Offline) cargado y listo en el navegador.");
      })();
    }
    return this.initializationPromise;
  }

  /**
   * Genera los embeddings vectoriales para un texto dado.
   */
  async getVector(text: string): Promise<number[]> {
    if (!this.extractor) {
      await this.initModel();
    }
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data); 
  }

  /**
   * Calcula la similitud del coseno entre dos vectores espaciales.
   */
  cosineSimilarity(vecA: readonly number[], vecB: readonly number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const length = Math.min(vecA.length, vecB.length);

    // Optimización V8: Ciclo unificado (For-loop iterativo minimiza el overhead cognitivo de la VM)
    for (let i = 0; i < length; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Buscador principal que evalúa la similitud de los nodos contra un input del usuario.
   */
  async findBestMatch<T extends SearchNode>(input: string, nodosCandidatos: T[]): Promise<T | null> {
    if (!input || !input.trim()) return null;

    const textoLimpio = this.limpiarTexto(input);
    if (!textoLimpio) return null;

    // Procesamiento paralelo asíncrono temporal
    const vectorUsuarioPromise = this.getVector(textoLimpio);
    
    // Generación de vectores contextuales (Map evita mutación de estado externo)
    const contextosNodos = nodosCandidatos.map(nodo => 
      `${nodo.nombre} ${nodo.sinonimos?.join(" ") ?? ""}`.toLowerCase()
    );

    // Concurrencia optimizada: Resolvemos todos los vectores en paralelo en el Event Loop
    const [vectorUsuario, ...vectoresNodos] = await Promise.all([
      vectorUsuarioPromise,
      ...contextosNodos.map(contexto => this.getVector(contexto))
    ]);
    
    let mejorNodo: T | null = null;
    let maxScore = -1; 
    const UMBRAL_ACEPTACION = 0.50; 

    // Evaluación lineal
    for (let i = 0; i < nodosCandidatos.length; i++) {
      const score = this.cosineSimilarity(vectorUsuario, vectoresNodos[i]);

      if (score > maxScore) {
        maxScore = score;
        mejorNodo = nodosCandidatos[i];
      }
    }

    return maxScore >= UMBRAL_ACEPTACION ? mejorNodo : null;
  }
}