import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment'; 

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  private socket: Socket;

  constructor() {
    // Conectamos al mismo puerto donde está corriendo tu server.js de Node
    this.socket = io(environment.apiUrlNode);
  }

  // Método genérico para enviar (emitir) datos
  emitirEvento(nombreEvento: string, data: any): void {
    this.socket.emit(nombreEvento, data);
  }

  // Método genérico para recibir (escuchar) datos
  escucharEvento(nombreEvento: string, callback: (data: any) => void): void {
    this.socket.on(nombreEvento, callback);
  }
}