const EmailJSService = {
    sdkLoaded: false,

    async cargarSDK() {
        if (this.sdkLoaded) return true;
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                this.sdkLoaded = true;
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.async = true;
            script.onload = () => {
                this.sdkLoaded = true;
                resolve(true);
            };
            script.onerror = () => reject(new Error('No se pudo cargar EmailJS SDK'));
            document.head.appendChild(script);
        });
    },

    async enviarMensajeContacto(datos) {
        const config = getEmailJSConfig();

        if (!config.activo) {
            return { success: false, error: 'EmailJS está desactivado' };
        }

        try {
            await this.cargarSDK();

            emailjs.init(config.publicKey);

            const templateParams = {
                name: datos.nombre,
                email: datos.email,
                message: datos.mensaje,
                time: new Date().toLocaleString('es-VE', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                })
            };

            const response = await emailjs.send(
                config.serviceId,
                config.templateId,
                templateParams
            );

            return { success: true, response };
        } catch (error) {
            console.error('Error EmailJS:', error);
            return { success: false, error: error.text || error.message || 'Error desconocido' };
        }
    },

    async testConnection() {
        return this.enviarMensajeContacto({
            nombre: 'Test Carissma',
            email: 'test@carissma.local',
            mensaje: 'Este es un mensaje de prueba del panel admin de Carissma.'
        });
    }
};
