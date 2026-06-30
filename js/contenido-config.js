const DEFAULT_CONTENIDO_CONFIG = {
    terminos: {
        titulo: 'Términos y Condiciones',
        ultimaActualizacion: 'Junio 2026',
        secciones: [
            { id: 's1', titulo: '1. Aceptación de los Términos', contenido: 'Al acceder y utilizar el sitio web de Carissma, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le solicitamos no utilizar nuestro Sitio.' },
            { id: 's2', titulo: '2. Productos y Precios', contenido: 'Los precios de nuestros productos están sujetos a cambios sin previo aviso. Nos reservamos el derecho de modificar o descontinuar cualquier producto en cualquier momento.' }
        ]
    },
    privacidad: {
        titulo: 'Política de Privacidad',
        ultimaActualizacion: 'Junio 2026',
        secciones: [
            { id: 's1', titulo: '1. Información que Recopilamos', contenido: 'Recopilamos información personal como nombre, email, dirección y teléfono cuando realizas un pedido o te registras en nuestro sitio.' },
            { id: 's2', titulo: '2. Uso de la Información', contenido: 'Utilizamos tu información personal únicamente para procesar pedidos, mejorar tu experiencia y enviar comunicaciones relacionadas con tu cuenta.' }
        ]
    },
    devoluciones: {
        titulo: 'Garantías y Devoluciones',
        ultimaActualizacion: 'Junio 2026',
        secciones: [
            { id: 's1', titulo: '1. Política de Devoluciones', contenido: 'Aceptamos devoluciones dentro de los 14 días naturales posteriores a la entrega, siempre que el producto esté en su empaque original y sin uso.' },
            { id: 's2', titulo: '2. Proceso de Reembolso', contenido: 'Una vez recibido e inspeccionado el producto, procesaremos tu reembolso en un plazo de 5 a 10 días hábiles al mismo método de pago original.' }
        ]
    }
};

function getContenidoConfig() {
    const stored = localStorage.getItem('carissma_contenido_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const merged = { ...DEFAULT_CONTENIDO_CONFIG };
            Object.keys(parsed).forEach(key => {
                if (merged[key] && typeof merged[key] === 'object') {
                    merged[key] = { ...merged[key], ...parsed[key] };
                } else {
                    merged[key] = parsed[key];
                }
            });
            return merged;
        } catch (e) {
            return DEFAULT_CONTENIDO_CONFIG;
        }
    }
    return DEFAULT_CONTENIDO_CONFIG;
}

function saveContenidoConfig(config) {
    localStorage.setItem('carissma_contenido_config', JSON.stringify(config));
}

function getSeccion(tipo, id) {
    const config = getContenidoConfig();
    if (!config[tipo] || !config[tipo].secciones) return null;
    return config[tipo].secciones.find(s => s.id === id);
}
