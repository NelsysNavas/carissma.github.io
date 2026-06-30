function cargarFormularioEmailJS() {
    const config = getEmailJSConfig();
    document.getElementById('emailjs-publickey').value = config.publicKey || '';
    document.getElementById('emailjs-serviceid').value = config.serviceId || '';
    document.getElementById('emailjs-templateid').value = config.templateId || '';
    document.getElementById('emailjs-destino').value = config.destinoEmail || '';
    const toggle = document.getElementById('emailjs-toggle');
    const status = document.getElementById('emailjs-status');
    if (toggle) {
        if (config.activo) toggle.classList.add('active');
        else toggle.classList.remove('active');
    }
    if (status) {
        if (config.activo) {
            status.textContent = 'Activo';
            status.classList.remove('text-zinc-400');
            status.classList.add('text-green-500');
        } else {
            status.textContent = 'Inactivo';
            status.classList.add('text-zinc-400');
            status.classList.remove('text-green-500');
        }
    }
}

function toggleEmailJSActivo() {
    const toggle = document.getElementById('emailjs-toggle');
    const status = document.getElementById('emailjs-status');
    if (!toggle) return;
    const isActive = toggle.classList.contains('active');
    if (isActive) {
        toggle.classList.remove('active');
        if (status) {
            status.textContent = 'Inactivo';
            status.classList.add('text-zinc-400');
            status.classList.remove('text-green-500');
        }
    } else {
        toggle.classList.add('active');
        if (status) {
            status.textContent = 'Activo';
            status.classList.remove('text-zinc-400');
            status.classList.add('text-green-500');
        }
    }
}

function guardarConfiguracionEmailJS() {
    const toggle = document.getElementById('emailjs-toggle');
    const config = {
        publicKey: document.getElementById('emailjs-publickey').value.trim(),
        serviceId: document.getElementById('emailjs-serviceid').value.trim(),
        templateId: document.getElementById('emailjs-templateid').value.trim(),
        destinoEmail: document.getElementById('emailjs-destino').value.trim() || 'nelsysnavas.music@gmail.com',
        activo: toggle ? toggle.classList.contains('active') : true
    };

    if (!config.publicKey || !config.serviceId || !config.templateId) {
        mostrarMensajeEmailJS('error', '⚠️ Completa todos los campos obligatorios');
        return;
    }

    saveEmailJSConfig(config);
    mostrarMensajeEmailJS('exito', '✅ Configuración guardada correctamente');
}

async function testEmailJS() {
    const btn = event.target;
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<svg class="animate-spin h-4 w-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enviando...';
    btn.disabled = true;

    try {
        const result = await EmailJSService.testConnection();
        if (result.success) {
            mostrarMensajeEmailJS('exito', '✅ Email de prueba enviado. Revisa tu bandeja de entrada.');
        } else {
            mostrarMensajeEmailJS('error', '❌ Error: ' + result.error);
        }
    } catch (error) {
        mostrarMensajeEmailJS('error', '❌ Error inesperado: ' + error.message);
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

function mostrarMensajeEmailJS(tipo, mensaje) {
    const div = document.getElementById('emailjs-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 6000);
}
