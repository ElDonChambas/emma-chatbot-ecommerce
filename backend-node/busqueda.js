/* ARCHIVO: busqueda.js - Arquitectura Híbrida (Fuzzy + Vector + Markov) */

const SearchEngine = {
    extractor: null,

    // 1. STOPWORDS
    STOPWORDS: [
        "el", "la", "los", "las", "un", "una", "unos", "unas", 
        "de", "del", "y", "o", "que", "en", "por", "para", "con",
        "dias", "tardes", "noches", "quiero", "quisiera", "busco",
        "necesito", "me", "das", "tienes", "como", "cuales", "algo"
    ],

    // 2. FUNCIÓN PARA LIMPIAR EL RUIDO
    limpiarTexto: function(text) {
        if (!text) return "";
        let limpio = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");
        let palabras = limpio.split(/\s+/);
        palabras = palabras.filter(p => p.length > 2 && !this.STOPWORDS.includes(p));
        return palabras.join(" ");
    },

    // 3. INICIALIZACIÓN DE MODELO
    initModel: async function() {
        if (!this.extractor) {
            let pipeline;
            if (typeof window === 'undefined') {
                const transformers = await import('@xenova/transformers');
                pipeline = transformers.pipeline;
            } else {
                // 1. Usamos la versión 2.14.0 estable
                const transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0');
                
                // 2. Desactivamos los modelos locales de forma segura
                Object.assign(transformers.env, { allowLocalModels: false });
                
                // 3. ¡NUEVO!: Forzamos la ruta estricta de los archivos WebAssembly.
                // Esto evita que el CDN busque el archivo fantasma "jsep.mjs" en la última versión.
                Object.assign(transformers.env.backends.onnx.wasm, {
                    wasmPaths: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/'
                });
                
                pipeline = transformers.pipeline;
            }
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("Modelo de vectores cargado y listo.");
        }
    },

    getVector: async function(text) {
        if (!this.extractor) await this.initModel();
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        return output.data; 
    },

    // ALGORITMO 1: LEVENSHTEIN (Fuzzy Matching)
    levenshtein: function(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
                else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
        return matrix[b.length][a.length];
    },

    // ALGORITMO 2: SIMILITUD DE COSENO (Semántica)
    cosineSimilarity: function(vecA, vecB) {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    },

    // ALGORITMO 3: MARKOV (PageRank / Importancia Estructural)
    getMarkovScore: function(nodos) {
        const scores = {};
        nodos.forEach(n => scores[n.id] = 1 / nodos.length);
        for(let i=0; i<3; i++) {
            nodos.forEach(n => {
                if(n.aristas) {
                    n.aristas.forEach(destId => {
                        if(scores[destId]) scores[destId] += scores[n.id] / n.aristas.length;
                    });
                }
            });
        }
        
        // CORRECCIÓN 1: Normalizar para evitar el "Efecto Agujero Negro"
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore > 0) {
            for(let key in scores) scores[key] /= maxScore; // El puntaje máximo ahora siempre es 1.0
        }
        return scores;
    },

    // BÚSQUEDA CENTRALIZADA
    findBestMatch: async function(mensajeActual, queryEnriquecida, nodosCandidatos) {
        const queryFuzzy = this.limpiarTexto(mensajeActual); // Solo el presente
        const querySemantica = this.limpiarTexto(queryEnriquecida); // El contexto completo
        
        if (!queryFuzzy) return null;

        const markovScores = this.getMarkovScore(nodosCandidatos);
        const vectorUsuario = await this.getVector(querySemantica); // Vectores usan memoria

        let mejorNodo = null;
        let mejorPuntajeHibrido = -1;
        
        // El Fuzzy Match AHORA SOLO divide y compara el mensaje actual
        const queryPalabras = queryFuzzy.split(' '); 

        for (const nodo of nodosCandidatos) {
            // 1. Calcular Fuzzy (Tolerancia a errores) -> ¡Sin memoria fantasma!
            let maxFuzzy = 0;
            const palabrasNodo = [nodo.nombre, ...(nodo.sinonimos || [])];
            
            palabrasNodo.forEach(p => {
                const pLimpia = this.limpiarTexto(p);
                if (!pLimpia) return;
                
                const distFrase = this.levenshtein(queryFuzzy, pLimpia);
                let simFrase = 1 - (distFrase / Math.max(queryFuzzy.length, pLimpia.length));
                
                let maxPalabraSim = 0;
                const palabrasDelNodo = pLimpia.split(' ');
                queryPalabras.forEach(qp => {
                    palabrasDelNodo.forEach(np => {
                        const distPalabra = this.levenshtein(qp, np);
                        const sim = 1 - (distPalabra / Math.max(qp.length, np.length));
                        if (sim > maxPalabraSim) maxPalabraSim = sim;
                    });
                });

                let similitud = (simFrase * 0.4) + (maxPalabraSim * 0.6);
                if (similitud > maxFuzzy) maxFuzzy = similitud;
            });

            // 2. Calcular Coseno (Semántica) -> Usa Vectores con memoria
            const textoNodo = this.limpiarTexto(`${nodo.nombre} ${nodo.sinonimos?.join(' ')}`);
            const vectorNodo = await this.getVector(textoNodo);
            const scoreCoseno = this.cosineSimilarity(vectorUsuario, vectorNodo);

            // 3. FUSIÓN DE ALGORITMOS
            let puntajeHibrido = (maxFuzzy * 0.4) + (scoreCoseno * 0.4) + ((markovScores[nodo.id] || 0) * 0.2);

            // MEMORIA ESTRUCTURAL
            if (nodo.relacion === 'hijo') puntajeHibrido *= 1.25;      
            if (nodo.relacion === 'hermano') puntajeHibrido *= 1.15;   
            if (nodo.relacion === 'padre') puntajeHibrido *= 0.90;     
            if (nodo.relacion === 'raiz') puntajeHibrido *= 0.80;      
            if (nodo.relacion === 'actual') puntajeHibrido *= 0.50;    

            // --- NUEVO: ESCUDO PROCEDURAL ---
            // Si el nodo ejecuta una acción (ej. comprar), DEBE ser un hijo directo del nodo actual.
            // Si el usuario intenta acceder desde lejos (Deep Search), lo penalizamos masivamente
            // para obligarlo a pasar primero por el nodo de información del producto.
            if (nodo.accion && nodo.relacion !== 'hijo') {
                puntajeHibrido *= 0.10; // Penalización del 90%
            }
            
            if (puntajeHibrido > mejorPuntajeHibrido) {
                mejorPuntajeHibrido = puntajeHibrido; 
                mejorNodo = nodo;
            }
        }

        console.log(`Puntaje Híbrido Final: ${mejorPuntajeHibrido}`); 
        return mejorPuntajeHibrido > 0.65 ? mejorNodo : null; 
    }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SearchEngine;
} else {
    window.SearchEngine = SearchEngine;
}