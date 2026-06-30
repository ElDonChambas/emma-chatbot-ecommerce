import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TIENDAS_LOCALES } from '../../data/tiendas_local'; 
import { CircuitBreakerService } from './circuit-breaker';
import { SearchService } from './search';
import { environment } from '../../../environments/environment';


/**
 * Contrato estructural para la respuesta del motor offline.
 */
export interface OfflineResult {
  readonly respuesta: string;
  readonly nodo?: any; // Contiene la acción y parámetros si el match fue exitoso
}

interface LocalContext {
  readonly tiendaId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly circuitBreaker: CircuitBreakerService = inject(CircuitBreakerService);
  private readonly searchEngine: SearchService = inject(SearchService);

  private readonly apiUrl: string = `${environment.apiUrlNode}/chat`;
  private readonly API_KEY: string = 'chatbot-key';
  
  private localContext: LocalContext = { tiendaId: null };

  async enviarMensajeOnline(mensaje: string): Promise<any> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuito Abierto');
    }

    const headers: HttpHeaders = new HttpHeaders({
      'x-api-key': this.API_KEY
    });

    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.apiUrl, { message: mensaje }, { headers })
      );
      return response; 
    } catch (error: unknown) {
      this.circuitBreaker.recordFailure();
      throw error; 
    }
  }

  /**
   * Procesa la lógica de chat en modo offline mapeando estructuras de datos complejas.
   */
  async procesarLocalmente(mensaje: string): Promise<OfflineResult> {
    const cleanMsg: string = mensaje.toLowerCase();

    // 1. Guard Clause: Intento de entrada a una tienda específica
    const tiendaSolicitada = TIENDAS_LOCALES.find(t => 
      cleanMsg.includes(t.nombre.toLowerCase())
    );

    if (tiendaSolicitada) {
      this.setLocalContext(tiendaSolicitada.id);
      const raiz = tiendaSolicitada.nodos.find(n => n.tipo === 'raiz');
      return {
        respuesta: `(Modo Offline - ${tiendaSolicitada.nombre}) ${raiz?.respuesta ?? 'Bienvenido'}`
      };
    }

    // 2. Guard Clause: Verificación de contexto activo
    if (!this.localContext.tiendaId) {
      return {
        respuesta: this.getPromptSeleccionTienda()
      };
    }

    const tienda = TIENDAS_LOCALES.find(t => t.id === this.localContext.tiendaId);
    if (!tienda) return { respuesta: "Error crítico local." };

    // 3. Lógica de salida/despedida
    const nodoFinal = tienda.nodos.find(n => n.tipo === 'final');
    const esDespedida = nodoFinal?.sinonimos.some(s => cleanMsg.includes(s.toLowerCase()));

    if (esDespedida) {
      this.setLocalContext(null);
      return {
        respuesta: `${nodoFinal?.respuesta} (Has salido al menú principal)`
      };
    }

    // 4. Búsqueda semántica (Vector Search con ONNX Local)
    const nodoGanador = await this.searchEngine.findBestMatch(mensaje, tienda.nodos);

    if (nodoGanador) {
      return {
        respuesta: `(Offline) ${nodoGanador.respuesta}`,
        nodo: nodoGanador // Enviamos el nodo completo al componente
      };
    }

    return {
      respuesta: `(Offline) No encontré nada relacionado a "${mensaje}" en ${tienda.nombre}.`
    };
  }

  private setLocalContext(tiendaId: string | null): void {
    this.localContext = { ...this.localContext, tiendaId };
  }

  private getPromptSeleccionTienda(): string {
    const nombres: string = TIENDAS_LOCALES.map(t => t.nombre).join(" o ");
    return `(Modo Offline) El servidor está caído. ¿A qué tienda quieres entrar localmente? Tenemos: ${nombres}`;
  }
}