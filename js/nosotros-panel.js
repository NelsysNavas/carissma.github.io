function cargarFormularioNosotros() {
    const config = getNosotrosConfig();

    const imagenPreview = document.getElementById('nosotros-imagen-preview');
    const imagenInput = document.getElementById('nosotros-imagen');
    if (imagenPreview) imagenPreview.src = config.imagen || DEFAULT_NOSOTROS_CONFIG.imagen;
    if (imagenInput) imagenInput.value = config.imagen || '';

    const etiquetaInput = document.getElementById('nosotros-etiqueta');
    if (etiquetaInput) etiquetaInput.value = config.etiqueta || DEFAULT_NOSOTROS_CONFIG.etiqueta;

    const tituloInput = document.getElementById('nosotros-titulo');
    if (tituloInput) tituloInput.value = config.titulo || DEFAULT_NOSOTROS_CONFIG.titulo;

    const parrafoEditor = document.getElementById('nosotros-parrafo');
    if (parrafoEditor) {
        parrafoEditor.innerHTML = config.parrafo || DEFAULT_NOSOTROS_CONFIG.parrafo;
    }
}

async function subirImagenNosotros(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('❌ Formato no válido. Solo JPG, PNG o WebP');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen excede 5MB. Por favor usa una más pequeña.');
        return;
    }

    const progress = document.getElementById('nosotros-upload-progress');
    if (progress) progress.classList.remove('hidden');

    try {
        const result = await CloudinaryService.uploadImage(file);
        const input = document.getElementById('nosotros-imagen');
        const preview = document.getElementById('nosotros-imagen-preview');
        if (input) input.value = result.url;
        if (preview) preview.src = result.url;
        if (progress) progress.classList.add('hidden');
        alert('✅ Imagen subida correctamente a Cloudinary');
    } catch (error) {
        if (progress) progress.classList.add('hidden');
        alert('❌ Error: ' + error.message);
    }
}

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('nosotros-parrafo').focus();
}

async function guardarConfiguracionNosotros() {
    const config = {
        imagen: document.getElementById('nosotros-imagen').value.trim() || DEFAULT_NOSOTROS_CONFIG.imagen,
        etiqueta: document.getElementById('nosotros-etiqueta').value.trim() || DEFAULT_NOSOTROS_CONFIG.etiqueta,
        titulo: document.getElementById('nosotros-titulo').value.trim() || DEFAULT_NOSOTROS_CONFIG.titulo,
        parrafo: document.getElementById('nosotros-parrafo').innerHTML.trim() || DEFAULT_NOSOTROS_CONFIG.parrafo
    };

    saveNosotrosConfig(config);

    try {
        await db.collection('configuracion').doc('nosotros').set({
            imagen: config.imagen,
            etiqueta: config.etiqueta,
            titulo: config.titulo,
            parrafo: config.parrafo
        });
        mostrarMensajeNosotros('exito', '✅ Configuración guardada correctamente');
        actualizarNosotrosEnFront();
    } catch (error) {
        mostrarMensajeNosotros('error', '⚠️ Guardado localmente. Error al sincronizar con Firebase: ' + error.message);
        actualizarNosotrosEnFront();
    }
}

function mostrarMensajeNosotros(tipo, mensaje) {
    const div = document.getElementById('nosotros-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

function actualizarNosotrosEnFront() {
    if (typeof cargarSeccionNosotros === 'function') {
        cargarSeccionNosotros();
    }
}
