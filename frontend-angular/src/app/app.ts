import { Component } from '@angular/core';
import { Chat } from './features/chat/chat';

/**
 * Componente raíz de la aplicación (Bootstrapper).
 * Se remueve OnPush para permitir la propagación natural del Change Detection 
 * sobre los eventos asíncronos generados por el chatbot.
 */
@Component({
  selector: 'app-root',
  imports: [Chat], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { 
  /**
   * Identificador principal de la aplicación.
   * Se mantiene el tipado estricto e inmutabilidad estructural.
   */
  readonly title: string = 'chatbot-angular';
}