const DEFAULT_EMAILJS_CONFIG = {
    publicKey: "XZ8jsCEsZ_cMUJLLk",
    serviceId: "service_ll0cyih",
    templateId: "template_2r0e57g",
    destinoEmail: "nelsysnavas.music@gmail.com",
    activo: true
};

function getEmailJSConfig() {
    const stored = localStorage.getItem('carissma_emailjs_config');
    if (stored) {
        try {
            return { ...DEFAULT_EMAILJS_CONFIG, ...JSON.parse(stored) };
        } catch (e) {
            return DEFAULT_EMAILJS_CONFIG;
        }
    }
    return DEFAULT_EMAILJS_CONFIG;
}

function saveEmailJSConfig(config) {
    localStorage.setItem('carissma_emailjs_config', JSON.stringify(config));
}
