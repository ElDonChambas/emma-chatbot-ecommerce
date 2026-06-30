function crearPedido(data) {
    console.log("📝 Registrando pedido en base de datos...", data.item);
    // Le asignamos un ID falso al pedido para simular la base de datos
    const nuevaOrden = { 
        id_orden: `ORD-${Math.floor(Math.random() * 1000)}`, 
        ...data 
    };
    return nuevaOrden;
}

module.exports = { crearPedido };