const DEFAULT_CLOUDINARY_CONFIG = {
    cloudName: "dnwo4gayj",
    uploadPreset: "carissma_preset",
    folder: "carissma"
};

function getCloudinaryConfig() {
    const stored = localStorage.getItem('carissma_cloudinary_config');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parseando config Cloudinary, usando default');
        }
    }
    return DEFAULT_CLOUDINARY_CONFIG;
}

function saveCloudinaryConfig(config) {
    localStorage.setItem('carissma_cloudinary_config', JSON.stringify(config));
}

function clearCloudinaryConfig() {
    localStorage.removeItem('carissma_cloudinary_config');
}
