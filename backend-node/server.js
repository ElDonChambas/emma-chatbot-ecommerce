const express = require('express');
const cors = require('cors');
const http = require('http');
const socketModule = require('./socket'); 
const gatekeeper = require('./middleware/gatekeeper');
const ChatFacade = require('./ChatFacade');
const orderManager = require('./orderManager');
const pagos = require('./pagos');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

socketModule.init(server);

app.post('/chat', gatekeeper, async (req, res) => {
    const userMessage = req.body.message;
    // ChatFacade ahora debería devolver el objeto del nodo completo, no solo el string
    const nodoGanador = await ChatFacade.getResponse(userMessage); 

    res.json({ 
        response: nodoGanador.respuesta, // El texto para el chat
        metadata: {                      // Información oculta para el botón
            id: nodoGanador.id,
            precio: nodoGanador.precio || 0,
            nombre: nodoGanador.nombre,
            tipo: nodoGanador.tipo
        },
        carritoActualizado: nodoGanador.carritoActualizado
    });
});

app.post('/pedido', async (req, res) => {
    const datosPedido = req.body;
    
    try {
        // 1. orderManager.js (Lógica de pedidos)
        const orden = orderManager.crearPedido(datosPedido);
        
        // 2. pagos.js (Procesa transacción)
        const resultadoPago = await pagos.procesarPago(orden);
        
        // 3. socket.js (Emite evento en tiempo real)
        const socketModule = require('./socket');
        socketModule.getIO().emit('pago_confirmado', resultadoPago);
        
        // 4. Respondemos al HTTP inicial
        res.json({ mensaje: "Pedido en proceso", resultado: resultadoPago });
        
    } catch (error) {
        console.error("Error procesando pedido:", error);
        res.status(500).json({ error: "Fallo en el servidor" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor REST y WebSocket corriendo en el puerto ${PORT}`);
});