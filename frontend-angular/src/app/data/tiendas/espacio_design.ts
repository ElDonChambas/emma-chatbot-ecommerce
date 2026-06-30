export const espacioDesign = {
    "id": "espacio_design",
    "nombre": "Espacio Design",
    "nodos": [
        {
            "id": "root_espacio_design",
            "tipo": "raiz",
            "nombre": "Inicio",
            "sinonimos": ["inicio", "menu", "catalogo", "hola", "buenas", "buenos", "comenzar"],
            "pregunta": "¿Qué deseas buscar en Espacio Design?",
            "respuesta": "Bienvenido a Espacio Design. Tenemos Muebles de decoración, Muebles de cocina y Papelería.",
            "aristas": ["cat_decoracion", "cat_cocina", "cat_papeleria"]
        },
        {
            "id": "cat_decoracion",
            "tipo": "categoria",
            "nombre": "Muebles de Decoración",
            "sinonimos": ["decoracion", "sala", "adorno", "muebles", "deco"],
            "pregunta": "¿Qué estilo de decoración buscas?",
            "respuesta": "Para decoración tenemos opciones para Sala e Iluminación.",
            "aristas": ["sub_sala", "sub_iluminacion"]
        },
        {
            "id": "sub_sala",
            "tipo": "subcategoria",
            "nombre": "Sala",
            "sinonimos": ["sala", "estar", "sillon", "centro"],
            "pregunta": "¿Buscas sofás o mesas?",
            "respuesta": "Tenemos Sofá de dos plazas y Mesa de centro moderna.",
            "aristas": ["prod_sofa", "prod_mesa_centro"]
        },
        {
            "id": "sub_iluminacion",
            "tipo": "subcategoria",
            "nombre": "Iluminación",
            "sinonimos": ["iluminacion", "luz", "lampara", "foco"],
            "pregunta": "¿Qué tipo de lámpara necesitas?",
            "respuesta": "Tenemos Lámpara de pie y Lámpara de escritorio.",
            "aristas": ["prod_lampara_pie", "prod_lampara_escritorio"]
        },
        {
            "id": "prod_sofa",
            "tipo": "producto",
            "nombre": "Sofá Gris Nórdico",
            "sinonimos": ["sofa", "sillon", "gris", "nordico"],
            "pregunta": "¿Agregamos el Sofá?",
            "precio": "250.00",
            "respuesta": "El Sofá Gris Nórdico cuesta $250.00.",
            "aristas": ["comprar_sofa", "final_espacio_design"]
        },
        {
            "id": "comprar_sofa",
            "nombre": "Agregar Sofa al carrito",
            "sinonimos": ["quiero el sofa", "comprar sofa", "llevar", "agregalo", "si"],
            "respuesta": "¡Excelente elección! Preparando tu Sofa.",
            "aristas": ["sub_sala", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Sofá Gris Nórdico", 250.00]
        },
        {
            "id": "prod_mesa_centro",
            "tipo": "producto",
            "nombre": "Mesa de Centro",
            "sinonimos": ["mesa", "centro", "madera", "cafe"],
            "pregunta": "¿Agregamos la Mesa de Centro?",
            "precio": "85.00",
            "respuesta": "La Mesa de Centro minimalista cuesta $85.00.",
            "aristas": ["comprar_mesa_centro", "final_espacio_design"]
        },
        {
            "id": "comprar_mesa_centro",
            "nombre": "Agregar Mesa de Centro al carrito",
            "sinonimos": ["quiero la mesa", "comprar mesa", "llevar", "agregala", "si"],
            "respuesta": "Anotado. Una Mesa de Centro para ti.",
            "aristas": ["sub_sala", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Mesa de Centro", 85.00]
        },
        {
            "id": "prod_lampara_pie",
            "tipo": "producto",
            "nombre": "Lámpara de Pie",
            "sinonimos": ["lampara pie", "alta", "esquina"],
            "pregunta": "¿Agregamos la Lámpara de Pie?",
            "precio": "45.00",
            "respuesta": "La Lámpara de Pie industrial cuesta $45.00.",
            "aristas": ["comprar_lampara_pie", "final_espacio_design"]
        },
        {
            "id": "comprar_lampara_pie",
            "nombre": "Agregar Lámpara de Pie al carrito",
            "sinonimos": ["quiero la lampara de pie", "comprar", "llevar", "agregala", "si"],
            "respuesta": "¡Perfecto! Lámpara de pie agregada.",
            "aristas": ["sub_iluminacion", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Lámpara de Pie", 45.00]
        },
        {
            "id": "prod_lampara_escritorio",
            "tipo": "producto",
            "nombre": "Lámpara de Escritorio",
            "sinonimos": ["lampara escritorio", "mesa", "lectura"],
            "pregunta": "¿Agregamos la Lámpara de Escritorio?",
            "precio": "20.00",
            "respuesta": "La Lámpara de Escritorio LED cuesta $20.00.",
            "aristas": ["comprar_lampara_escritorio", "final_espacio_design"]
        },
        {
            "id": "comprar_lampara_escritorio",
            "nombre": "Agregar Lámpara de Escritorio al carrito",
            "sinonimos": ["quiero la lampara de escritorio", "comprar", "llevar", "agregala", "si"],
            "respuesta": "¡Iluminará muy bien! Agregada a tu orden.",
            "aristas": ["sub_iluminacion", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Lámpara de Escritorio", 20.00]
        },
        {
            "id": "cat_cocina",
            "tipo": "categoria",
            "nombre": "Muebles de Cocina",
            "sinonimos": ["cocina", "gabinete", "comedor", "cocinar"],
            "pregunta": "¿Qué mueble de cocina necesitas?",
            "respuesta": "Tenemos opciones de Almacenamiento y Mesas.",
            "aristas": ["sub_almacenaje", "sub_mesas_cocina"]
        },
        {
            "id": "sub_almacenaje",
            "tipo": "subcategoria",
            "nombre": "Almacenamiento",
            "sinonimos": ["almacenaje", "guardar", "alacena", "estante", "almacenamiento"],
            "pregunta": "¿Buscas alacena o carrito auxiliar?",
            "respuesta": "Tenemos Alacena vertical y Carrito auxiliar.",
            "aristas": ["prod_alacena", "prod_carrito"]
        },
        {
            "id": "sub_mesas_cocina",
            "tipo": "subcategoria",
            "nombre": "Mesas y Sillas",
            "sinonimos": ["mesas", "sillas", "comedor"],
            "pregunta": "¿Buscas mesa o taburetes?",
            "respuesta": "Tenemos Mesa desayunadora y Taburete alto.",
            "aristas": ["prod_mesa_desayuno", "prod_taburete"]
        },
        {
            "id": "prod_alacena",
            "tipo": "producto",
            "nombre": "Alacena Vertical",
            "sinonimos": ["alacena", "mueble alto", "despensa"],
            "pregunta": "¿Agregamos la Alacena?",
            "precio": "120.00",
            "respuesta": "La Alacena Vertical blanca cuesta $120.00.",
            "aristas": ["comprar_alacena", "final_espacio_design"]
        },
        {
            "id": "comprar_alacena",
            "nombre": "Agregar Alacena al carrito",
            "sinonimos": ["quiero la alacena", "comprar", "llevar", "agregala", "si"],
            "respuesta": "Excelente espacio para tu cocina. Alacena agregada.",
            "aristas": ["sub_almacenaje", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Alacena Vertical", 120.00]
        },
        {
            "id": "prod_carrito",
            "tipo": "producto",
            "nombre": "Carrito Auxiliar",
            "sinonimos": ["carrito", "ruedas", "verduras", "organizador"],
            "pregunta": "¿Agregamos el Carrito?",
            "precio": "35.00",
            "respuesta": "El Carrito Auxiliar de metal cuesta $35.00.",
            "aristas": ["comprar_carrito", "final_espacio_design"]
        },
        {
            "id": "comprar_carrito",
            "nombre": "Agregar Carrito Auxiliar al carrito",
            "sinonimos": ["quiero el carrito", "comprar", "llevar", "agregalo", "si"],
            "respuesta": "Muy práctico. Carrito auxiliar agregado.",
            "aristas": ["sub_almacenaje", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Carrito Auxiliar", 35.00]
        },
        {
            "id": "prod_mesa_desayuno",
            "tipo": "producto",
            "nombre": "Mesa Desayunadora",
            "sinonimos": ["mesa", "desayuno", "barra", "desayunador"],
            "pregunta": "¿Agregamos la Mesa?",
            "precio": "90.00",
            "respuesta": "La Mesa Desayunadora pequeña cuesta $90.00.",
            "aristas": ["comprar_mesa_desayuno", "final_espacio_design"]
        },
        {
            "id": "comprar_mesa_desayuno",
            "nombre": "Agregar Mesa Desayunadora al carrito",
            "sinonimos": ["quiero la mesa", "comprar", "llevar", "agregala", "si"],
            "respuesta": "Lista para esos desayunos. Mesa agregada.",
            "aristas": ["sub_mesas_cocina", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Mesa Desayunadora", 90.00]
        },
        {
            "id": "prod_taburete",
            "tipo": "producto",
            "nombre": "Taburete Alto",
            "sinonimos": ["taburete", "silla alta", "banco"],
            "pregunta": "¿Agregamos el Taburete?",
            "precio": "25.00",
            "respuesta": "El Taburete Alto cuesta $25.00.",
            "aristas": ["comprar_taburete", "final_espacio_design"]
        },
        {
            "id": "comprar_taburete",
            "nombre": "Agregar Taburete Alto al carrito",
            "sinonimos": ["quiero el taburete", "comprar", "llevar", "agregalo", "si"],
            "respuesta": "Un toque moderno. Taburete agregado.",
            "aristas": ["sub_mesas_cocina", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Taburete Alto", 25.00]
        },
        {
            "id": "cat_papeleria",
            "tipo": "categoria",
            "nombre": "Papelería",
            "sinonimos": ["papeleria", "oficina", "escuela", "utiles"],
            "pregunta": "¿Qué artículo de papelería buscas?",
            "respuesta": "Tenemos Cuadernos y Escritura.",
            "aristas": ["sub_cuadernos", "sub_escritura"]
        },
        {
            "id": "sub_cuadernos",
            "tipo": "subcategoria",
            "nombre": "Cuadernos y Agendas",
            "sinonimos": ["cuaderno", "libreta", "agenda", "papel"],
            "pregunta": "¿Prefieres agenda o libreta?",
            "respuesta": "Tenemos Agenda Ejecutiva y Libreta de notas.",
            "aristas": ["prod_agenda", "prod_libreta"]
        },
        {
            "id": "sub_escritura",
            "tipo": "subcategoria",
            "nombre": "Escritura",
            "sinonimos": ["escritura", "lapiz", "pluma", "escribir"],
            "pregunta": "¿Buscas bolígrafos o plumones?",
            "respuesta": "Tenemos Set de Bolígrafos y Plumones Pastel.",
            "aristas": ["prod_boligrafos", "prod_plumones"]
        },
        {
            "id": "prod_agenda",
            "tipo": "producto",
            "nombre": "Agenda Ejecutiva",
            "sinonimos": ["agenda", "diario", "planificador", "ejecutiva"],
            "pregunta": "¿Agregamos la Agenda?",
            "precio": "15.00",
            "respuesta": "La Agenda Ejecutiva 2026 cuesta $15.00.",
            "aristas": ["comprar_agenda", "final_espacio_design"]
        },
        {
            "id": "comprar_agenda",
            "nombre": "Agregar Agenda Ejecutiva al carrito",
            "sinonimos": ["quiero la agenda", "comprar", "llevar", "agregala", "si"],
            "respuesta": "Para organizar bien tu 2026. Agenda agregada.",
            "aristas": ["sub_cuadernos", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Agenda Ejecutiva 2026", 15.00]
        },
        {
            "id": "prod_libreta",
            "tipo": "producto",
            "nombre": "Libreta de Notas",
            "sinonimos": ["libreta", "apuntes"],
            "pregunta": "¿Agregamos la Libreta?",
            "precio": "8.00",
            "respuesta": "La Libreta de tapa dura cuesta $8.00.",
            "aristas": ["comprar_libreta", "final_espacio_design"]
        },
        {
            "id": "comprar_libreta",
            "nombre": "Agregar Libreta de Notas al carrito",
            "sinonimos": ["quiero la libreta", "comprar", "llevar", "agregala", "si"],
            "respuesta": "Lista para tus apuntes. Libreta agregada.",
            "aristas": ["sub_cuadernos", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Libreta de Notas", 8.00]
        },
        {
            "id": "prod_boligrafos",
            "tipo": "producto",
            "nombre": "Set de lapiceros",
            "sinonimos": ["boligrafos", "lapiceros", "plumas", "tinta"],
            "pregunta": "¿Agregamos los lapiceros?",
            "precio": "5.00",
            "respuesta": "El Set de 3 lapiceros finos cuesta $5.00.",
            "aristas": ["comprar_boligrafos", "final_espacio_design"]
        },
        {
            "id": "comprar_boligrafos",
            "nombre": "Agregar Set de lapiceros al carrito",
            "sinonimos": ["quiero los lapiceros", "comprar", "llevar", "agregalos", "si"],
            "respuesta": "Trazos perfectos garantizados. Set de lapiceros agregado.",
            "aristas": ["sub_escritura", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Set de lapiceros", 5.00]
        },
        {
            "id": "prod_plumones",
            "tipo": "producto",
            "nombre": "Plumones Pastel",
            "sinonimos": ["plumones", "resaltadores", "marcadores", "colores"],
            "pregunta": "¿Agregamos los Plumones?",
            "precio": "6.50",
            "respuesta": "El paquete de Plumones Pastel cuesta $6.50.",
            "aristas": ["comprar_plumones", "final_espacio_design"]
        },
        {
            "id": "comprar_plumones",
            "nombre": "Agregar Plumones Pastel al carrito",
            "sinonimos": ["quiero los plumones", "comprar", "llevar", "agregalos", "si"],
            "respuesta": "A darle color a esos apuntes. Plumones agregados.",
            "aristas": ["sub_escritura", "pagar_carrito", "final_espacio_design"],
            "accion": "agregarAlCarrito",
            "parametros": ["Plumones Pastel", 6.50]
        },
        {
            "id": "final_espacio_design",
            "tipo": "final",
            "nombre": "Despedida",
            "sinonimos": ["gracias", "adios", "bye", "salir", "terminar", "fin"],
            "pregunta": "",
            "respuesta": "¡Gracias por visitar Espacio Design! Esperamos que disfrutes tus compras.",
            "aristas": []
        }
    ]
}