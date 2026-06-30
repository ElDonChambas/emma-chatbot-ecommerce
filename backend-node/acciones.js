/* ARCHIVO: acciones.js */

const acciones = {
    // Ahora recibe el estadoActual como segundo parámetro
    agregarAlCarrito: (parametros, estadoActual) => {
        const [producto, precio] = parametros;
        
        // Calculamos el total simulando que ya se agregó (para el texto de respuesta)
        const nuevoTotal = estadoActual.carrito.reduce((sum, item) => sum + item.precio, 0) + parseFloat(precio);
        
        return {
            // El texto que dirá el bot
            texto: `\n🛒 *[Sistema: Se agregó ${producto} al carrito. Total a pagar: $${nuevoTotal.toFixed(2)}]*`,
            // La "solicitud" oficial para el Núcleo
            accionEstado: {
                tipo: 'AGREGAR_CARRITO',
                payload: { producto, precio }
            }
        };
    },
    
    verCarrito: (estadoActual) => {
        if (estadoActual.carrito.length === 0) return { texto: "\n🛒 *[Sistema: Tu carrito está vacío por ahora.]*" };
        
        let detalle = estadoActual.carrito.map(item => `- ${item.producto}: $${item.precio.toFixed(2)}`).join('\n');
        const total = estadoActual.carrito.reduce((sum, item) => sum + item.precio, 0);
        
        return { texto: `\n🛒 *[Tu Carrito:]*\n${detalle}\n*Total: $${total.toFixed(2)}*` };
    },

    vaciarCarrito: () => {
        return {
            texto: "\n🛒 *[Sistema: El carrito ha sido vaciado exitosamente.]*",
            // La "solicitud" oficial para el Núcleo
            accionEstado: { tipo: 'VACIAR_CARRITO' }
        };
    },

    obtenerEstadoCarrito: (estadoActual) => {
        const total = estadoActual.carrito.reduce((sum, item) => sum + item.precio, 0);
        return { items: estadoActual.carrito, total: total.toFixed(2) };
    }
};

module.exports = acciones;