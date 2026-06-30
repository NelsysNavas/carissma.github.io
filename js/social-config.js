const DEFAULT_SOCIAL_CONFIG = {
    whatsapp: {
        activo: true,
        numero: '584125274000',
        mensaje: '¡Hola! Me interesa conocer más sobre sus productos de Carissma.'
    },
    instagram: {
        activo: true,
        usuario: 'carissma',
        url: 'https://instagram.com/carissma'
    },
    facebook: {
        activo: false,
        url: ''
    },
    tiktok: {
        activo: false,
        usuario: '',
        url: ''
    },
    youtube: {
        activo: false,
        url: ''
    },
    pinterest: {
        activo: false,
        url: ''
    }
};

function getSocialConfig() {
    const stored = localStorage.getItem('carissma_social_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const merged = { ...DEFAULT_SOCIAL_CONFIG };
            Object.keys(parsed).forEach(key => {
                merged[key] = { ...DEFAULT_SOCIAL_CONFIG[key], ...parsed[key] };
            });
            return merged;
        } catch (e) {
            return DEFAULT_SOCIAL_CONFIG;
        }
    }
    return DEFAULT_SOCIAL_CONFIG;
}

function saveSocialConfig(config) {
    localStorage.setItem('carissma_social_config', JSON.stringify(config));
}

function isSocialActivo(plataforma) {
    const config = getSocialConfig();
    return config[plataforma] && config[plataforma].activo === true;
}

function getWhatsAppLink() {
    const config = getSocialConfig();
    if (!config.whatsapp.activo) return null;
    const numero = (config.whatsapp.numero || '').replace(/[^0-9]/g, '');
    const mensaje = encodeURIComponent(config.whatsapp.mensaje || '');
    return `https://wa.me/${numero}?text=${mensaje}`;
}
