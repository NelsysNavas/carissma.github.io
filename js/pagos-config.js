const DEFAULT_PAGOS_CONFIG = {
    pago_movil: {
        activo: true,
        banco: '0102 - Banco de Venezuela',
        cedula: 'V-12.345.678',
        telefono: '0412-5274000',
        beneficiario: 'Nelsys Navas'
    },
    transferencia: {
        activo: true,
        banco: '0102 - Banco de Venezuela',
        cuenta: '0134-0123-12-1234567890',
        titular: 'Nelsys Navas',
        cedula: 'V-12.345.678'
    },
    zelle: {
        activo: true,
        email: 'nelsysnavas.music@gmail.com',
        nombre: 'Nelsys Navas'
    },
    paypal: {
        activo: true,
        email: 'nelsysnavas.music@gmail.com'
    },
    efectivo: {
        activo: true,
        mensaje: 'Nos pondremos en contacto contigo para coordinar la entrega y el pago en efectivo en San Fernando de Apure.'
    }
};

const METODOS_PAGO_LABELS = {
    pago_movil: 'Pago Móvil',
    transferencia: 'Transferencia Bancaria',
    zelle: 'Zelle',
    paypal: 'PayPal',
    efectivo: 'Efectivo / Pago en Persona'
};

const METODOS_PAGO_ICONS = {
    pago_movil: '📱',
    transferencia: '🏦',
    zelle: '🔗',
    paypal: '💰',
    efectivo: '💵'
};

const METODOS_PAGO_COLORS = {
    pago_movil: 'green',
    transferencia: 'blue',
    zelle: 'purple',
    paypal: 'yellow',
    efectivo: 'orange'
};

function getPagosConfig() {
    const stored = localStorage.getItem('carissma_pagos_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const merged = { ...DEFAULT_PAGOS_CONFIG };
            Object.keys(parsed).forEach(key => {
                if (merged[key]) {
                    merged[key] = { ...merged[key], ...parsed[key] };
                }
            });
            return merged;
        } catch (e) {
            return DEFAULT_PAGOS_CONFIG;
        }
    }
    return DEFAULT_PAGOS_CONFIG;
}

function savePagosConfig(config) {
    localStorage.setItem('carissma_pagos_config', JSON.stringify(config));
}

function getMetodosPagoActivos() {
    const config = getPagosConfig();
    return Object.keys(config).filter(key => config[key].activo);
}

function getMetodoPago(key) {
    const config = getPagosConfig();
    return config[key] || DEFAULT_PAGOS_CONFIG[key];
}
