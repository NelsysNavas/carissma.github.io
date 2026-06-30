function cargarFormularioSEO() {
    const config = getSEOConfig();

    const gaId = document.getElementById('seo-ga-id');
    if (gaId) gaId.value = config.googleAnalytics.id || '';
    const gaCodigo = document.getElementById('seo-ga-codigo');
    if (gaCodigo) gaCodigo.value = config.googleAnalytics.codigoCompleto || '';

    const scContent = document.getElementById('seo-sc-content');
    if (scContent) scContent.value = config.searchConsole.content || '';

    const mpPixel = document.getElementById('seo-mp-pixel');
    if (mpPixel) mpPixel.value = config.metaPixel.pixelId || '';

    ['googleAnalytics', 'searchConsole', 'metaPixel'].forEach(servicio => {
        const toggle = document.getElementById(`seo-${servicio}-toggle`);
        const status = document.getElementById(`seo-${servicio}-status`);
        const content = document.getElementById(`seo-${servicio}-content`);

        if (toggle) {
            if (config[servicio].activo) toggle.classList.add('active');
            else toggle.classList.remove('active');
        }
        if (status) {
            if (config[servicio].activo) {
                status.textContent = 'Activo';
                status.classList.remove('text-zinc-400');
                status.classList.add('text-green-500');
            } else {
                status.textContent = 'Inactivo';
                status.classList.add('text-zinc-400');
                status.classList.remove('text-green-500');
            }
        }
        if (content) {
            if (config[servicio].activo) {
                content.classList.remove('opacity-40', 'pointer-events-none');
            } else {
                content.classList.add('opacity-40', 'pointer-events-none');
            }
        }
    });
}

function toggleSEOActivo(servicio) {
    const toggle = document.getElementById(`seo-${servicio}-toggle`);
    const status = document.getElementById(`seo-${servicio}-status`);
    const content = document.getElementById(`seo-${servicio}-content`);
    if (!toggle) return;

    const isActive = toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.remove('active');
        if (status) {
            status.textContent = 'Inactivo';
            status.classList.add('text-zinc-400');
            status.classList.remove('text-green-500');
        }
        if (content) content.classList.add('opacity-40', 'pointer-events-none');
    } else {
        toggle.classList.add('active');
        if (status) {
            status.textContent = 'Activo';
            status.classList.remove('text-zinc-400');
            status.classList.add('text-green-500');
        }
        if (content) content.classList.remove('opacity-40', 'pointer-events-none');
    }
}

function guardarConfiguracionSEO() {
    const config = {
        googleAnalytics: {
            activo: document.getElementById('seo-googleAnalytics-toggle').classList.contains('active'),
            id: document.getElementById('seo-ga-id').value.trim(),
            codigoCompleto: document.getElementById('seo-ga-codigo').value.trim()
        },
        searchConsole: {
            activo: document.getElementById('seo-searchConsole-toggle').classList.contains('active'),
            content: document.getElementById('seo-sc-content').value.trim()
        },
        metaPixel: {
            activo: document.getElementById('seo-metaPixel-toggle').classList.contains('active'),
            pixelId: document.getElementById('seo-mp-pixel').value.trim()
        }
    };

    if (config.googleAnalytics.activo && !config.googleAnalytics.id && !config.googleAnalytics.codigoCompleto) {
        mostrarMensajeSEO('error', '⚠️ Debes ingresar el ID o el código completo de Google Analytics');
        return;
    }
    if (config.searchConsole.activo && !config.searchConsole.content) {
        mostrarMensajeSEO('error', '⚠️ Debes ingresar el código de verificación de Search Console');
        return;
    }
    if (config.metaPixel.activo && !config.metaPixel.pixelId) {
        mostrarMensajeSEO('error', '⚠️ Debes ingresar el ID del Meta Pixel');
        return;
    }

    saveSEOConfig(config);

    if (typeof inyectarScriptsSEO === 'function') {
        inyectarScriptsSEO();
    }

    mostrarMensajeSEO('exito', '✅ Configuración de Analytics & SEO guardada. Los cambios se aplican en el front.');
}

function mostrarMensajeSEO(tipo, mensaje) {
    const div = document.getElementById('seo-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}
