const CloudinaryService = {

    async uploadImage(file) {
        const config = getCloudinaryConfig();

        if (!config.cloudName || !config.uploadPreset) {
            throw new Error('Cloudinary no está configurado. Ve a Configuración → Cloudinary en el admin.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.uploadPreset);
        if (config.folder) {
            formData.append('folder', config.folder);
        }

        const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error al subir imagen');
            }

            const data = await response.json();
            return {
                url: data.secure_url,
                publicId: data.public_id,
                width: data.width,
                height: data.height
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    },

    async uploadFromUrl(imageUrl) {
        const config = getCloudinaryConfig();

        if (!config.cloudName || !config.uploadPreset) {
            throw new Error('Cloudinary no está configurado.');
        }

        const formData = new FormData();
        formData.append('file', imageUrl);
        formData.append('upload_preset', config.uploadPreset);
        if (config.folder) {
            formData.append('folder', config.folder);
        }

        const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error al subir imagen');
            }

            const data = await response.json();
            return {
                url: data.secure_url,
                publicId: data.public_id
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    }
};
