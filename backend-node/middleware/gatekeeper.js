/*
 * ARQUITECTURA: Security Middleware (Interceptor de Seguridad)
 * PATRÓN DE DISEÑO: Chain of Responsibility (Cadena de Responsabilidad - Express)
 * LÓGICA DE ENTRADA: HTTP Request Headers (Extracción de credencial)
 * LÓGICA DE SALIDA: Delegación de control (Next) o Rechazo Inmediato (HTTP 403)
 */

module.exports = function gatekeeper(req, res, next) {
    // --- FASE 1: EXTRACCIÓN DE CREDENCIALES ---
    // Se busca la llave específica en los encabezados de la petición entrante
    const apiKey = req.headers["x-api-key"];

    // --- FASE 2: VALIDACIÓN DE IDENTIDAD (AUTENTICACIÓN) ---
    // Comparación estricta de la llave recibida contra la llave maestra
    // En un sistema de 1M usuarios, aquí conectaríamos con Redis o un servicio IAM
    if (!apiKey || apiKey !== "chatbot-key") {
        // Bloqueo inmediato: No se procesa nada más para ahorrar recursos
        return res.status(403).json({ error: "Acceso denegado" });
    }

    // --- FASE 3: DELEGACIÓN DE CONTROL ---
    // El "portero" abre la puerta y permite que la petición continúe al siguiente paso (Controller)
    next();
};