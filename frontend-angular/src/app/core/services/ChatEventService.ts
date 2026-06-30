import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

// Definimos los tipos de eventos que pueden ocurrir en nuestro chat
export interface ChatEvent {
  type: 'USER_MESSAGE' | 'BOT_RESPONSE' | 'SYSTEM_ERROR' | 'OFFLINE_MODE_ACTIVE';
  payload: string | any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatEventsService {
  // El Subject es como un "megáfono". Alguien habla por él, y muchos pueden escuchar.
  private eventBus = new Subject<ChatEvent>();
  
  // Exponemos el megáfono como un Observable para que los componentes solo puedan escuchar, no emitir accidentalmente
  public events$: Observable<ChatEvent> = this.eventBus.asObservable();

  // Método para que cualquier parte de la app emita un evento
  emit(event: ChatEvent): void {
    this.eventBus.next(event);
  }
}