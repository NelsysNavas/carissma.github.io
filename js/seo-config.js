const DEFAULT_SEO_CONFIG = {
    googleAnalytics: {
        activo: false,
        id: '',
        codigoCompleto: ''
    },
    searchConsole: {
        activo: false,
        content: ''
    },
    metaPixel: {
        activo: false,
        pixelId: ''
    }
};

function getSEOConfig() {
    const stored = localStorage.getItem('carissma_seo_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const merged = { ...DEFAULT_SEO_CONFIG };
            Object.keys(parsed).forEach(key => {
                if (merged[key]) {
                    merged[key] = { ...merged[key], ...parsed[key] };
                }
            });
            return merged;
        } catch (e) {
            return DEFAULT_SEO_CONFIG;
        }
    }
    return DEFAULT_SEO_CONFIG;
}

function saveSEOConfig(config) {
    localStorage.setItem('carissma_seo_config', JSON.stringify(config));
}
