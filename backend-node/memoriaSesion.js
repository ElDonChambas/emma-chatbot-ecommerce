/* ARCHIVO: memoriaSesion.js */
const SearchEngine = require('./busqueda');

class MemoriaSesion {
    constructor() {
        // Almacena objetos: { textoOriginal: string, textoLimpio: string }
        this.historial = []; 
        // Cuántos mensajes hacia atrás queremos recordar para mantener el "tema"
        this.limiteVentana = 3; 

        // --- NUEVO: MEMORIA EPISÓDICA ---
        this.episodios = []; // El "diario" de la sesión
    }

    agregarMensaje(texto) {
        const limpio = SearchEngine.limpiarTexto(texto);
        if (!limpio || limpio.length < 3) return; // Ignorar ruido o respuestas muy cortas

        this.historial.push({ textoOriginal: texto, textoLimpio: limpio });

        // Si excedemos el límite, borramos el más antiguo (FIFO)
        if (this.historial.length > this.limiteVentana) {
            this.historial.shift();
        }
    }

    // Devuelve un string uniendo los mensajes recientes para dar contexto
    obtenerContextoReciente() {
        if (this.historial.length === 0) return "";
        return this.historial.map(m => m.textoLimpio).join(" ");
    }
    
    // Limpia la memoria (útil si el usuario cambia de tienda abruptamente)
    limpiarMemoria() {
        this.historial = [];
    }

    // --- NUEVAS FUNCIONES EPISÓDICAS ---
    registrarEpisodio(accion, detalle) {
        // Guardamos el evento con la hora actual
        const hora = new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
        this.episodios.push({ hora, accion, detalle });
    }

    obtenerResumenEpisodico() {
        if (this.episodios.length === 0) return "Aún no has explorado nada en esta sesión.";
        
        let resumen = "📖 Aquí tienes el resumen de tu sesión hoy:\n";
        this.episodios.forEach(ep => {
            if (ep.accion === 'VISITA_TIENDA') resumen += `- 🏪 A las ${ep.hora} entraste a ${ep.detalle}.\n`;
            if (ep.accion === 'CONSULTA_PRODUCTO') resumen += `- 🏷️ A las ${ep.hora} consultaste sobre ${ep.detalle}.\n`;
        });
        return resumen;
    }
}

// Exportamos una instancia única para que la RAM conserve el estado durante la sesión
module.exports = MemoriaSesion;