import { Component, inject, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat'; 
import { Websocket } from '../../websocket';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  readonly texto: string;
  readonly esUsuario: boolean;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {

  mostrarInfo: boolean = false;
  isThinking: boolean = false;
  public isVoiceLoading: boolean = false;

  // --- DEPENDENCY INVERSION & ABSTRACTION ---
  private readonly chatService: ChatService = inject(ChatService);
  private readonly wsService: Websocket = inject(Websocket);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('chatContainer') 
  private readonly chatContainer!: ElementRef<HTMLDivElement>;

  // --- ESTADO ---
  public userInput: string = '';
  
  // --- ESTADO DE CONFIGURACIÓN ---
  public vocesDisponibles = [
    { id: 'es-MX-DaliaNeural', nombre: '🇲🇽 Dalia (México)' },
    { id: 'es-SV-LorenaNeural', nombre: '🇸🇻 Lorena (El Salvador)' },
    { id: 'es-AR-ElenaNeural', nombre: '🇦🇷 Elena (Argentina)' },
    { id: 'es-ES-ElviraNeural', nombre: '🇪🇸 Elvira (España)' },
    { id: 'es-CO-SalomeNeural', nombre: '🇨🇴 Salomé (Colombia)' }
  ];
  public vozSeleccionada: string = 'es-SV-LorenaNeural'; // Valor por defecto

  public readonly mensajes: ChatMessage[] = [
    { texto: 'Hola 👋 ¿En qué puedo ayudarte?', esUsuario: false }
  ];

  public productoEnContexto: any = null;
  public mostrarCarrito: boolean = false;
  public carritoItems: any[] = [];
  public totalCarrito: string = "0.00";

  // --- ESTADO DE VOZ Y MICRÓFONO ---
  public isRecording: boolean = false;
  public isTranscribing: boolean = false;
  // Como usamos Python en el backend, el micrófono siempre está listo al iniciar
  public whisperReady: boolean = true; 
  public whisperStatus: string = 'Micrófono listo';
  public isInitializingMic: boolean = false; // Candado anti-doble clic
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  // --- CICLO DE VIDA ---
  ngOnInit(): void {
    // Escuchamos eventos de WebSocket
    this.wsService.escucharEvento('pago_confirmado', (data: any) => {
      const mensajeConfirmacion = `¡Pago aprobado! 🎉 Tu pedido de ${data.orden.item} (ID: ${data.orden.id_orden}) se procesó con éxito. Transacción: ${data.transaccion}`;
      this.agregarMensaje(mensajeConfirmacion, false);
      this.cdr.detectChanges();
    });

    // Marca de agua en Consola
    console.log(
      '%c Emma Chatbot \n%cDesarrollado por Rodrigo Ávila \nGitHub: @ElDonChambas',
      'color: #2563eb; font-size: 22px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); padding-bottom: 4px;',
      'color: #4b5563; font-size: 14px; font-style: italic;'
    );
  }

  ngOnDestroy(): void {
    if (this.isRecording) {
      this.detenerGrabacion();
    }
  }

  

  // --- INTEGRACIÓN NATIVA DE MICRÓFONO ---
  public async toggleGrabacion(): Promise<void> {
    if (this.isInitializingMic) return; 

    if (this.isRecording) {
      this.detenerGrabacion();
    } else {
      await this.iniciarGrabacion();
    }
  }

  private async iniciarGrabacion(): Promise<void> {
    this.isInitializingMic = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false; 
        this.isTranscribing = true;
        this.whisperStatus = 'Transcribiendo con IA...';
        this.cdr.detectChanges(); 

        try {
          // Empaquetamos el audio crudo para Python
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'grabacion.webm');

          // Petición al nuevo microservicio de FastAPI
          const respuesta = await fetch(`${environment.apiUrlPython}/transcribir`, {
            method: 'POST',
            body: formData
          });

          if (!respuesta.ok) throw new Error("Error en el servidor de voz");

          const data = await respuesta.json();
          
          this.isTranscribing = false;
          this.whisperStatus = 'Micrófono listo';
          this.cdr.detectChanges();

          // Si entendió algo, lo inyecta en el chat
          if (data.texto && data.texto.trim() !== '') {
              this.userInput = data.texto;
              this.enviarMensaje(); 
          }

        } catch (error) {
          console.error("Error al procesar el audio:", error);
          this.whisperStatus = 'Error de conexión con IA';
          this.isTranscribing = false;
          this.cdr.detectChanges();
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.whisperStatus = 'Escuchando...';
      this.cdr.detectChanges(); 

    } catch (error) {
      console.error('Error accediendo al micrófono:', error);
      this.whisperStatus = 'Permiso de micrófono denegado';
      this.cdr.detectChanges();
    } finally {
      this.isInitializingMic = false;
    }
  }

  private detenerGrabacion(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  // --- CONTROL FLOW ---
  // 2. Modifica el método enviarMensaje() para separar los momentos:
public async enviarMensaje(): Promise<void> {
  const textoAProcesar: string = this.userInput.trim();
  if (!textoAProcesar) return;

  this.agregarMensaje(textoAProcesar, true);
  this.userInput = ''; 

  this.isThinking = true;
  this.cdr.detectChanges(); 

  try {
    // Petición al backend de Node
    const data: any = await this.chatService.enviarMensajeOnline(textoAProcesar);
    const textoRespuesta = data.respuesta || data.response;
    
    this.agregarMensaje(textoRespuesta, false);
    
    // 🔥 CLAVE: El texto ya llegó, así que apagamos la burbuja de "escribiendo" inmediatamente
    this.isThinking = false;
    this.cdr.detectChanges();

    // Ahora mandamos a reproducir la voz (este método manejará su propio indicador)
    await this.reproducirVozEmma(textoRespuesta);

    const carritoData = data.carritoActualizado || (data.metadata ? data.metadata.carritoActualizado : null);
    if (carritoData) {
      this.carritoItems = carritoData.items;
      this.totalCarrito = carritoData.total;
    }

    if (data.metadata && data.metadata.tipo === 'producto') {
      this.productoEnContexto = data.metadata;
    }
    
  } catch (error: unknown) {
    // Si falla el online, apagamos la animación de escritura antes de pasar al local
    this.isThinking = false;
    this.cdr.detectChanges();

    try {
      const resultado = await this.chatService.procesarLocalmente(textoAProcesar);
      this.agregarMensaje(resultado.respuesta, false);
      
      if (resultado.nodo) {
        this.ejecutarAccionOffline(resultado.nodo);
      }
    } catch (offlineError: unknown) {
      console.error("Fallo crítico en el motor offline:", offlineError);
      this.agregarMensaje("Lo siento, estoy teniendo problemas técnicos.", false);
    }
  } finally {
    // Nos aseguramos de liberar siempre la burbuja de texto pase lo que pase
    this.isThinking = false;
    this.cdr.detectChanges();
  }
}

  // --- MOTOR DE ACCIONES PROCEDURALES OFFLINE ---
  private ejecutarAccionOffline(nodo: any): void {
    if (!nodo || !nodo.accion) return;

    // Acción: Agregar producto al carrito local
    if (nodo.accion === 'agregarAlCarrito' && nodo.parametros) {
      const [nombreProducto, precioProducto] = nodo.parametros;

      // Buscamos si el artículo ya existe en la lista para incrementar su cantidad
      const itemExistente = this.carritoItems.find(item => item.nombre === nombreProducto);

      if (itemExistente) {
        itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
      } else {
        this.carritoItems.push({
          id: nodo.id,
          nombre: nombreProducto,
          precio: precioProducto,
          cantidad: 1
        });
      }

      // Cálculo del total acumulado iterando el Array de forma segura
      const total = this.carritoItems.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
      this.totalCarrito = total.toFixed(2);
      
      // Forzamos la detección de cambios para pintar el carrito inmediatamente en el HTML
      this.cdr.detectChanges();
    }

    // Acción: Vaciar carrito local
    if (nodo.accion === 'vaciarCarrito') {
      this.carritoItems = [];
      this.totalCarrito = "0.00";
      this.cdr.detectChanges();
    }
  }

  private agregarMensaje(texto: string, esUsuario: boolean): void {
    this.mensajes.push({ texto, esUsuario });
    this.sincronizarScroll();
  }

  private sincronizarScroll(): void {
    setTimeout(() => {
      if (!this.chatContainer?.nativeElement) return;
      try {
        const element: HTMLDivElement = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (error: unknown) {}
    }, 50);
  }

  public async enviarPedidoSimulado(): Promise<void> {
    if (!this.productoEnContexto) {
        this.agregarMensaje("Por favor, dime qué producto te interesa comprar primero.", false);
        return;
    }

    const pedido = {
        tienda: "Espacio Design",
        id_producto: this.productoEnContexto.id,
        item: this.productoEnContexto.nombre,
        precio: parseFloat(this.productoEnContexto.precio), 
        estado: "pendiente"
    };

    this.agregarMensaje(`Has solicitado: ${pedido.item} ($${pedido.precio}). Enviando solicitud de pago...`, true);

    try {
        const response = await fetch(`${environment.apiUrlNode}/pedido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });
        const resData = await response.json();
    } catch (error) {
        this.agregarMensaje('Hubo un error al procesar la solicitud HTTP.', false);
    }
  }

  // --- TEXT-TO-SPEECH (Voz Neuronal) ---
  public async reproducirVozEmma(texto: string): Promise<void> {
  // 🔊 Encendemos el indicador de voz
  this.isVoiceLoading = true;
  this.cdr.detectChanges();

  try {
    const respuesta = await fetch(`${environment.apiUrlPython}/hablar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texto: texto,
        voz: this.vozSeleccionada 
      })
    });

    if (!respuesta.ok) throw new Error("Error al generar la voz de Emma");

    const audioBlob = await respuesta.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const reproductor = new Audio(audioUrl);
    
    reproductor.play();

    reproductor.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

  } catch (error) {
    console.error("Error reproducidiendo voz:", error);
  } finally {
    // ⏹️ Apagamos el indicador cuando la API responda (ya sea con éxito o error)
    this.isVoiceLoading = false;
    this.cdr.detectChanges();
  }
}
}