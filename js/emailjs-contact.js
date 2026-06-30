async function enviarContacto(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const textoOriginal = btn.textContent;

    const nombre = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('message').value.trim();

    if (!nombre || !email || !mensaje) {
        showSectionModal('Campos Incompletos', 'Por favor completa todos los campos del formulario.');
        return;
    }

    const config = getEmailJSConfig();

    if (!config.activo) {
        showSectionModal('Mensaje Recibido', 'Gracias por escribirnos. Te responderemos pronto. (EmailJS desactivado por el administrador)');
        form.reset();
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<svg class="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enviando...';

    const result = await EmailJSService.enviarMensajeContacto({
        nombre,
        email,
        mensaje
    });

    btn.disabled = false;
    btn.textContent = textoOriginal;

    if (result.success) {
        showSectionModal('¡Mensaje Recibido!', 'Gracias por escribirnos. Te responderemos en un lapso de 24 horas hábiles.');
        form.reset();
    } else {
        showSectionModal('Error al Enviar', 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo o contáctanos por WhatsApp.');
        console.error('Error EmailJS:', result.error);
    }
}
