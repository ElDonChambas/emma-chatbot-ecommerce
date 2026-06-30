const { Server } = require('socket.io');

let io;

module.exports = {
    // Se llama una sola vez desde server.js al arrancar
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: "*", // En producción cambias al puerto de Angular
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log(`🔌 Cliente WS conectado: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`❌ Cliente WS desconectado: ${socket.id}`);
            });
            
            // Puedes dejar aquí listeners muy básicos o genéricos
        });
        
        return io;
    },
    
    // Se llama desde CUALQUIER otro archivo para emitir eventos
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io no ha sido inicializado!");
        }
        return io;
    }
};