async function procesarPago(orden) {
    console.log(`💳 Procesando pago para la orden ${orden.id_orden}...`);
    
    // Simulamos que el banco tarda 1.5 segundos en responder
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                status: 'aprobado', 
                transaccion: `TRX-${Date.now()}`, 
                orden: orden 
            });
        }, 1500);
    });
}

module.exports = { procesarPago };