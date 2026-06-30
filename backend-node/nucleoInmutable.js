/* ARCHIVO: nucleoInmutable.js */

const nucleoInmutable = {
    identidad: {
        nombre: "Emma",
        rol: "Asistente de ventas multitienda",
        tono: "amable, servicial y directo"
    },

    temasProhibidos: [
        /chucho|perro|gato|mascota|animal/i, 
        /politica|gobierno|presidente/i,
        /religio/i, 
        /tonto|estupido|aburrido|feo/i, 
        /arma|drog/i, 
        /chiste|broma/i 
    ],

    datosSensibles: [
        /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // Tarjetas de crédito
        /\b\d{8}[ -]?\d\b/ // Formato de DUI salvadoreño
    ],

    emergencia: [
        /humano|asesor|queja|reclamo|fraude/i
    ],

    evaluarMensaje: (mensajeUsuario) => {
        const mensajeLimpio = mensajeUsuario.toLowerCase();

        for (let regex of nucleoInmutable.datosSensibles) {
            if (regex.test(mensajeLimpio)) return { bloqueado: true, razon: "PII", respuesta: "🛡️ [ALERTA DE SEGURIDAD]: He detectado información personal. Mensaje borrado." };
        }
        for (let regex of nucleoInmutable.emergencia) {
            if (regex.test(mensajeLimpio)) return { bloqueado: true, razon: "Handoff", respuesta: "Te estoy transfiriendo con un asesor humano..." };
        }
        for (let regex of nucleoInmutable.temasProhibidos) {
            if (regex.test(mensajeLimpio)) return { bloqueado: true, razon: "Restricción", respuesta: "Lo siento, solo puedo ayudarte con compras en nuestras tiendas." };
        }
        return { bloqueado: false };
    },

    // --- NUEVO: GESTOR DE ESTADO INMUTABLE ---
    
    // 1. Define cómo nace el estado de una conversación
    crearEstadoInicial: () => ({
        tiendaId: null,
        nodoActualId: null,
        carrito: []
    }),

    // 2. EL REDUCER: El único lugar autorizado para aplicar cambios.
    // NUNCA modifica el objeto original (estadoActual), siempre retorna una copia nueva (...estadoActual).
    procesarAccion: (estadoActual, accion) => {
        switch (accion.tipo) {
            case 'CAMBIAR_TIENDA':
                return {
                    ...estadoActual,
                    tiendaId: accion.payload.tiendaId,
                    nodoActualId: accion.payload.nodoRaizId,
                    carrito: [] // Limpiamos el carrito al cambiar de tienda
                };
            
            case 'CAMBIAR_NODO':
                return {
                    ...estadoActual,
                    nodoActualId: accion.payload.nodoId
                };

            case 'AGREGAR_CARRITO':
                return {
                    ...estadoActual,
                    carrito: [...estadoActual.carrito, { 
                        producto: accion.payload.producto, 
                        precio: parseFloat(accion.payload.precio) 
                    }]
                };

            case 'VACIAR_CARRITO':
                return {
                    ...estadoActual,
                    carrito: []
                };

            default:
                return estadoActual; // Si no conoce la orden, no hace nada
        }
    }
};

module.exports = nucleoInmutable;