/* ARCHIVO: ChatFacade.js */

const fs = require('fs');
const path = require('path');
const SearchEngine = require('./busqueda');
const EventEmitter = require('events');
const chatEmitter = new EventEmitter();
const acciones = require('./acciones');
const nucleo = require('./nucleoInmutable');
const MemoriaSesion = require('./memoriaSesion');
const sesiones = new Map();

function obtenerSesion(sessionId) {
    if (!sesiones.has(sessionId)) {
        sesiones.set(sessionId, {
            estado: nucleo.crearEstadoInicial(),
            memoria: new MemoriaSesion() // Instancia única e independiente para su historial
        });
    }
    return sesiones.get(sessionId);
}

chatEmitter.on('STORE_SWITCH', (data) => {
    console.log(`Log: El usuario entró a la tienda: ${data.tienda}`);
});

// --- NUEVO: ESTADO INMUTABLE CENTRALIZADO ---
// Reemplazamos el antiguo contextoConversacion. 
// El Núcleo es el único que define cómo nace este estado.

class ChatFacade {
    static findParentNode(allNodes, childId) {
        return allNodes.find(n => n.aristas && n.aristas.includes(childId));
    }

    // 🔥 NUEVO: Recibe el sessionId como primer parámetro
    static async getResponse(sessionId, message) {
        // 1. Extraemos los datos exclusivos de este usuario
        const sesionActual = obtenerSesion(sessionId);
        let estadoUsuario = sesionActual.estado;
        let memoriaUsuario = sesionActual.memoria;

        const tiendasDir = path.join(__dirname, 'tiendas');
        let tiendas = [];
        
        try {
            const files = fs.readdirSync(tiendasDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(tiendasDir, file);
                    const tiendaData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    tiendas.push(tiendaData);
                }
            }
        } catch (error) {
            console.error("Error leyendo la carpeta de tiendas:", error);
            return { id: 'error', respuesta: "Error interno en la BD.", tipo: 'error' };
        }

        const userMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // --- EJECUCIÓN DEL NÚCLEO INMUTABLE (EL GUARDIÁN) ---
        // Le pasamos el mensaje original para que las Regex de seguridad funcionen mejor.
        const evaluacionNucleo = nucleo.evaluarMensaje(message); 
        
        if (evaluacionNucleo.bloqueado) {
            console.log(`🛡️ [NÚCLEO INMUTABLE]: Mensaje bloqueado. Razón: ${evaluacionNucleo.razon}`);
            return {
                id: 'bloqueado',
                respuesta: evaluacionNucleo.respuesta,
                tipo: 'warning'
            };
        }
        
        // --- ENRUTAMIENTO INICIAL ---
        const tiendaSolicitada = tiendas.find(t => 
            userMessage.includes(t.nombre.toLowerCase()) || 
            userMessage.includes(t.id.replace('_', ' '))
        );

        if (tiendaSolicitada) {
            if (estadoUsuario.tiendaId !== tiendaSolicitada.id) {
                chatEmitter.emit('STORE_SWITCH', { tienda: tiendaSolicitada.nombre });
                
                // Limpiamos memorias antiguas
                memoriaUsuario.limpiarMemoria();
                memoriaUsuario.registrarEpisodio('VISITA_TIENDA', tiendaSolicitada.nombre);
                
                const nuevaRaiz = tiendaSolicitada.nodos.find(n => n.tipo === 'raiz');
                
                // --- NUEVO: CAMBIO DE ESTADO (Cambiar Tienda) ---
                estadoUsuario = nucleo.procesarAccion(estadoUsuario, {
                    tipo: 'CAMBIAR_TIENDA',
                    payload: { tiendaId: tiendaSolicitada.id, nodoRaizId: nuevaRaiz.id }
                });
                sesionActual.estado = estadoUsuario;

                return {
                    id: nuevaRaiz.id,
                    respuesta: `(Entrando a ${tiendaSolicitada.nombre}) ... ${nuevaRaiz.respuesta}`,
                    tipo: 'info',
                    carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario)
                };
            }
        }

        if (!estadoUsuario.tiendaId) {
            const nombresTiendas = tiendas.map(t => t.nombre).join(' o ');
            return {
                id: 'lobby',
                respuesta: `Hola, aún no has elegido una tienda. ¿Quieres ir a ${nombresTiendas}?`,
                tipo: 'info'
            };
        }

        // --- NAVEGACIÓN DENTRO DE LA TIENDA ---
        const tienda = tiendas.find(t => t.id === estadoUsuario.tiendaId);
        if (!tienda) return { id: 'error', respuesta: 'La tienda seleccionada no existe.', tipo: 'error' };

        // Despedida / Salida de la tienda
        const despedida = tienda.nodos.find(n => n.tipo === 'final');
        if (despedida && despedida.sinonimos.some(s => s.trim() !== "" && new RegExp(`\\b${s}\\b`, 'i').test(userMessage))) {
            
            // --- NUEVO: CAMBIO DE ESTADO (Salir de la tienda) ---
            estadoUsuario = nucleo.procesarAccion(estadoUsuario, {
                tipo: 'CAMBIAR_TIENDA',
                payload: { tiendaId: null, nodoRaizId: null }
            });
            sesionActual.estado = estadoUsuario;

            return {
                id: 'lobby',
                respuesta: `${despedida.respuesta} (Ahora estás en el menú principal)`,
                tipo: 'info',
                carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario) // Devolverá carrito vacío
            };
        }

        // 1. INTERCEPTOR DE COMANDOS GLOBALES (ESCAPE HATCH)
        const comandosReinicio = ['hola', 'menu', 'inicio', 'volver', 'buenas'];
        if (comandosReinicio.some(cmd => userMessage.includes(cmd))) {
            const nodoRaiz = tienda.nodos.find(n => n.tipo === 'raiz');
            
            // --- NUEVO: CAMBIO DE ESTADO (Volver a la raíz) ---
            estadoUsuario = nucleo.procesarAccion(estadoUsuario, {
                tipo: 'CAMBIAR_NODO',
                payload: { nodoId: nodoRaiz.id }
            });
            sesionActual.estado = estadoUsuario;
            memoriaUsuario.limpiarMemoria();
            return {
                id: nodoRaiz.id,
                respuesta: nodoRaiz.respuesta,
                tipo: 'info',
                carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario)
            };
        }

        // COMANDO PARA LEER LA MEMORIA EPISÓDICA
        const comandosHistorial = ['resumen', 'historial', 'que he hecho', 'que he visto'];
        if (comandosHistorial.some(cmd => new RegExp(`\\b${cmd}\\b`, 'i').test(userMessage))) {
            return {
                id: 'historial',
                respuesta: memoriaUsuario.obtenerResumenEpisodico(),
                tipo: 'info'
            };
        }

        // --- COMANDOS DEL CARRITO (Funciones Puras) ---
        const comandosVerCarrito = ['ver carrito', 'mi carrito', 'mostrar carrito', 'que llevo'];
        if (comandosVerCarrito.some(cmd => new RegExp(`\\b${cmd}\\b`, 'i').test(userMessage))) {
            return {
                id: 'ver_carrito',
                // Ejecutamos la función pura pasándole el estado
                respuesta: acciones.verCarrito(estadoUsuario).texto, 
                tipo: 'info',
                carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario)
            };
        }

        const comandosVaciarCarrito = ['vaciar carrito', 'limpiar carrito', 'borrar carrito'];
        if (comandosVaciarCarrito.some(cmd => new RegExp(`\\b${cmd}\\b`, 'i').test(userMessage))) {
            const resultado = acciones.vaciarCarrito();
            
            // --- NUEVO: CAMBIO DE ESTADO (Aplicamos el vaciado) ---
            estadoUsuario = nucleo.procesarAccion(estadoUsuario, resultado.accionEstado);
            
            sesionActual.estado = estadoUsuario;

            return {
                id: 'vaciar_carrito',
                respuesta: resultado.texto,
                tipo: 'info',
                carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario)
            };
        }

        // 1. DETERMINAR NODO ACTUAL Y CANDIDATOS (CON MEMORIA ESTRUCTURAL)
        const nodoRaiz = tienda.nodos.find(n => n.tipo === 'raiz');
        let nodoActual = tienda.nodos.find(n => n.id === estadoUsuario.nodoActualId) || nodoRaiz;

        const hijos = tienda.nodos.filter(n => nodoActual.aristas.includes(n.id)).map(n => ({...n, relacion: 'hijo'}));
        const padreData = ChatFacade.findParentNode(tienda.nodos, nodoActual.id);
        const padre = padreData ? [{...padreData, relacion: 'padre'}] : [];
        let hermanos = [];
        if (padreData) {
            hermanos = tienda.nodos.filter(n => padreData.aristas.includes(n.id) && n.id !== nodoActual.id).map(n => ({...n, relacion: 'hermano'}));
        }
        const menuPrincipal = tienda.nodos.filter(n => nodoRaiz.aristas.includes(n.id)).map(n => ({...n, relacion: 'raiz'}));
        const actual = [{...nodoActual, relacion: 'actual'}];

        let candidatos = [...hijos, ...hermanos, padre, ...menuPrincipal, nodoActual].filter(Boolean);
        candidatos = candidatos.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i && v.tipo !== 'final');

        // 2. INTEGRACIÓN INTELIGENTE DE MEMORIA Y FALLBACK 
        const mensajeLimpio = SearchEngine.limpiarTexto(message);
        let queryEnriquecida = message;

        if (mensajeLimpio.length > 0) {
            const contextoPrevio = memoriaUsuario.obtenerContextoReciente();
            queryEnriquecida = contextoPrevio ? `${contextoPrevio} ${message}` : message;
        } else {
            chatEmitter.emit('FAILED_MATCH', { input: message });
            return {
                id: 'error',
                respuesta: `No te entendí bien. ${nodoActual.pregunta || "Por favor, intenta decirlo de otra forma."}`,
                tipo: 'error'
            };
        }

        let nodoGanador = await SearchEngine.findBestMatch(message, queryEnriquecida, candidatos);

        // 3. DEEP SEARCH
        if (!nodoGanador) {
            const nodosBuscables = tienda.nodos.filter(n => n.tipo !== 'final');
            nodoGanador = await SearchEngine.findBestMatch(message, queryEnriquecida, nodosBuscables);
        }

        // 4. RESPUESTA Y PERSISTENCIA DE ESTADO
        if (nodoGanador) {
            chatEmitter.emit('SUCCESSFUL_MATCH', { nodo: nodoGanador.id });
            memoriaUsuario.agregarMensaje(message);

            if (nodoGanador.tipo !== 'raiz') {
                memoriaUsuario.registrarEpisodio('CONSULTA_PRODUCTO', nodoGanador.nombre);
            }
            
            let respuestaFinal = nodoGanador.respuesta;
            
            // --- NUEVO: EJECUCIÓN PROCEDURAL INMUTABLE ---
            if (nodoGanador.accion && acciones[nodoGanador.accion]) {
                try {
                    // Ejecutamos la función PURA pasándole el estado y obtenemos la acción
                    const resultado = acciones[nodoGanador.accion](nodoGanador.parametros || [], estadoUsuario);
                    respuestaFinal += resultado.texto; 
                    
                    // El Núcleo procesa el nuevo estado (ej. agrega el producto al arreglo)
                    if (resultado.accionEstado) {
                        estadoUsuario = nucleo.procesarAccion(estadoUsuario, resultado.accionEstado);
                    }
                } catch (error) {
                    console.error("Error ejecutando acción procedural:", error);
                }
            }

            // --- NUEVO: ACTUALIZAMOS EL NODO ACTUAL VÍA NÚCLEO ---
            estadoUsuario = nucleo.procesarAccion(estadoUsuario, {
                tipo: 'CAMBIAR_NODO',
                payload: { nodoId: nodoGanador.id }
            });

            sesionActual.estado = estadoUsuario;
            sesiones.set(sessionId, sesionActual);

            return {
                id: nodoGanador.id,
                respuesta: respuestaFinal,
                tipo: 'info',
                carritoActualizado: acciones.obtenerEstadoCarrito(estadoUsuario)
            };
        } else {
            // Para el bloque del error, no hubo cambio de estado, pero es buena práctica devolverlo igual
            return {
                id: 'error',
                respuesta: `No encontré eso.`,
                tipo: 'error'
            };
        }
    }
}

module.exports = ChatFacade;