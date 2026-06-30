function cargarFormularioCloudinary() {
    const config = getCloudinaryConfig();
    document.getElementById('cl-cloudName').value = config.cloudName || '';
    document.getElementById('cl-uploadPreset').value = config.uploadPreset || '';
    document.getElementById('cl-folder').value = config.folder || '';
    verificarEstadoCloudinary();
}

function verificarEstadoCloudinary() {
    const config = getCloudinaryConfig();
    const statusIcon = document.getElementById('cloudinary-status-icon');
    const statusText = document.getElementById('cloudinary-status-text');
    const statusDetail = document.getElementById('cloudinary-status-detail');
    const sidebarDot = document.getElementById('cloudinary-status-dot');

    if (!statusIcon) return;

    if (!config.cloudName || !config.uploadPreset) {
        statusIcon.className = 'w-3 h-3 rounded-full bg-yellow-500';
        statusText.textContent = 'Sin configurar';
        statusText.className = 'text-sm font-semibold text-yellow-700';
        statusDetail.textContent = 'Completa los datos de Cloudinary para activar la subida de imágenes';
        if (sidebarDot) sidebarDot.className = 'ml-auto w-2 h-2 rounded-full bg-yellow-500';
        return;
    }

    statusIcon.className = 'w-3 h-3 rounded-full bg-green-500';
    statusText.textContent = 'Conectado';
    statusText.className = 'text-sm font-semibold text-green-700';
    statusDetail.textContent = `Cloud: ${config.cloudName} | Preset: ${config.uploadPreset}`;
    if (sidebarDot) sidebarDot.className = 'ml-auto w-2 h-2 rounded-full bg-green-500';
}

function guardarConfiguracionCloudinary() {
    const config = {
        cloudName: document.getElementById('cl-cloudName').value.trim(),
        uploadPreset: document.getElementById('cl-uploadPreset').value.trim(),
        folder: document.getElementById('cl-folder').value.trim()
    };

    if (!config.cloudName || !config.uploadPreset) {
        mostrarMensajeCloudinary('error', '⚠️ Cloud Name y Upload Preset son obligatorios');
        return;
    }

    try {
        saveCloudinaryConfig(config);
        mostrarMensajeCloudinary('exito', '✅ Configuración guardada correctamente');
        verificarEstadoCloudinary();
    } catch (error) {
        mostrarMensajeCloudinary('error', '❌ Error al guardar: ' + error.message);
    }
}

function limpiarConfiguracionCloudinary() {
    if (!confirm('¿Restaurar la configuración por defecto de Cloudinary?')) return;
    clearCloudinaryConfig();
    cargarFormularioCloudinary();
    mostrarMensajeCloudinary('exito', '🔄 Configuración restaurada');
}

function mostrarMensajeCloudinary(tipo, mensaje) {
    const div = document.getElementById('cloudinary-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

async function subirImagenCloudinary(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progress = document.getElementById('upload-progress');
    if (progress) progress.classList.remove('hidden');

    try {
        const result = await CloudinaryService.uploadImage(file);
        const input = document.getElementById('product-image');
        if (input) input.value = result.url;
        if (progress) progress.classList.add('hidden');
        alert('✅ Imagen subida correctamente a Cloudinary');
    } catch (error) {
        if (progress) progress.classList.add('hidden');
        alert('❌ Error: ' + error.message);
    }
    event.target.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(verificarEstadoCloudinary, 500);
});
