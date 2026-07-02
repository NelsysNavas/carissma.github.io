function cargarFormularioSocial() {
    const config = getSocialConfig();

    ['whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest'].forEach(red => {
        const rConfig = config[red] || { activo: false };
        const activoEl = document.getElementById(`social-${red}-activo`);
        const activoLabel = document.getElementById(`social-${red}-activo-label`);
        const contentEl = document.getElementById(`social-${red}-content`);

        if (activoEl) {
            if (rConfig.activo) {
                activoEl.classList.add('active');
                if (activoLabel) {
                    activoLabel.textContent = 'Activo';
                    activoLabel.classList.remove('text-zinc-400');
                    activoLabel.classList.add('text-green-500');
                }
            } else {
                activoEl.classList.remove('active');
                if (activoLabel) {
                    activoLabel.textContent = 'Inactivo';
                    activoLabel.classList.add('text-zinc-400');
                    activoLabel.classList.remove('text-green-500');
                }
            }
        }
        if (contentEl) {
            if (rConfig.activo) {
                contentEl.classList.remove('opacity-40', 'pointer-events-none');
            } else {
                contentEl.classList.add('opacity-40', 'pointer-events-none');
            }
        }
    });

    document.getElementById('social-whatsapp-numero').value = config.whatsapp.numero || '';
    document.getElementById('social-whatsapp-mensaje').value = config.whatsapp.mensaje || '';
    document.getElementById('social-instagram-usuario').value = config.instagram.usuario || '';
    document.getElementById('social-instagram-url').value = config.instagram.url || '';
    document.getElementById('social-facebook-url').value = config.facebook.url || '';
    document.getElementById('social-tiktok-usuario').value = config.tiktok.usuario || '';
    document.getElementById('social-tiktok-url').value = config.tiktok.url || '';
    document.getElementById('social-youtube-url').value = config.youtube.url || '';
    document.getElementById('social-pinterest-url').value = config.pinterest.url || '';
}

function toggleSocialActivo(red) {
    const toggle = document.getElementById(`social-${red}-activo`);
    const label = document.getElementById(`social-${red}-activo-label`);
    const content = document.getElementById(`social-${red}-content`);
    if (!toggle) return;

    const isActive = toggle.classList.contains('active');

    if (isActive) {
        toggle.classList.remove('active');
        if (label) {
            label.textContent = 'Inactivo';
            label.classList.add('text-zinc-400');
            label.classList.remove('text-green-500');
        }
        if (content) content.classList.add('opacity-40', 'pointer-events-none');
    } else {
        toggle.classList.add('active');
        if (label) {
            label.textContent = 'Activo';
            label.classList.remove('text-zinc-400');
            label.classList.add('text-green-500');
        }
        if (content) content.classList.remove('opacity-40', 'pointer-events-none');
    }
}

function guardarConfiguracionSocial() {
    const config = {
        whatsapp: {
            activo: document.getElementById('social-whatsapp-activo').classList.contains('active'),
            numero: document.getElementById('social-whatsapp-numero').value.trim(),
            mensaje: document.getElementById('social-whatsapp-mensaje').value.trim() || '¡Hola! Me interesa conocer más sobre sus productos.'
        },
        instagram: {
            activo: document.getElementById('social-instagram-activo').classList.contains('active'),
            usuario: document.getElementById('social-instagram-usuario').value.trim(),
            url: document.getElementById('social-instagram-url').value.trim()
        },
        facebook: {
            activo: document.getElementById('social-facebook-activo').classList.contains('active'),
            url: document.getElementById('social-facebook-url').value.trim()
        },
        tiktok: {
            activo: document.getElementById('social-tiktok-activo').classList.contains('active'),
            usuario: document.getElementById('social-tiktok-usuario').value.trim(),
            url: document.getElementById('social-tiktok-url').value.trim()
        },
        youtube: {
            activo: document.getElementById('social-youtube-activo').classList.contains('active'),
            url: document.getElementById('social-youtube-url').value.trim()
        },
        pinterest: {
            activo: document.getElementById('social-pinterest-activo').classList.contains('active'),
            url: document.getElementById('social-pinterest-url').value.trim()
        }
    };

    if (config.whatsapp.activo && !config.whatsapp.numero) {
        mostrarMensajeSocial('error', '⚠️ El número de WhatsApp es obligatorio si activas esa red');
        return;
    }

    saveSocialConfig(config);
    actualizarBotonesSociales();
    mostrarMensajeSocial('exito', '✅ Configuración de redes sociales guardada');
}

function mostrarMensajeSocial(tipo, mensaje) {
    const div = document.getElementById('social-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

function actualizarBotonesSociales() {
    const config = getSocialConfig();
    const waBtn = document.getElementById('whatsapp-float-btn');
    if (waBtn) {
        if (config.whatsapp.activo && config.whatsapp.numero) {
            const numero = config.whatsapp.numero.replace(/[^0-9]/g, '');
            const mensaje = encodeURIComponent(config.whatsapp.mensaje || '¡Hola! Me interesa conocer más sobre sus productos de Carissma.');
            waBtn.href = `https://wa.me/${numero}?text=${mensaje}`;
            waBtn.classList.remove('hidden');
        } else {
            waBtn.classList.add('hidden');
        }
    }

    const socialLinks = document.getElementById('footer-social-links');
    if (socialLinks) {
        socialLinks.innerHTML = '';
        if (config.instagram.activo && config.instagram.url) {
            socialLinks.innerHTML += `<a href="${config.instagram.url}" target="_blank" rel="noopener" class="hover:opacity-80 transition hover:scale-110 transform" title="Instagram"><img src="images/icon_instagram.png" alt="Instagram" class="w-10 h-10"></a>`;
        }
        if (config.facebook.activo && config.facebook.url) {
            socialLinks.innerHTML += `<a href="${config.facebook.url}" target="_blank" rel="noopener" class="hover:opacity-80 transition hover:scale-110 transform" title="Facebook"><img src="images/icon_facebook.png" alt="Facebook" class="w-10 h-10"></a>`;
        }
        if (config.tiktok.activo && config.tiktok.url) {
            socialLinks.innerHTML += `<a href="${config.tiktok.url}" target="_blank" rel="noopener" class="hover:opacity-80 transition hover:scale-110 transform" title="TikTok"><img src="images/icon_tiktok.png" alt="TikTok" class="w-10 h-10"></a>`;
        }
        if (config.youtube.activo && config.youtube.url) {
            socialLinks.innerHTML += `<a href="${config.youtube.url}" target="_blank" rel="noopener" class="hover:opacity-80 transition hover:scale-110 transform" title="YouTube"><img src="images/icon_youtube.png" alt="YouTube" class="w-10 h-10"></a>`;
        }
        if (config.pinterest.activo && config.pinterest.url) {
            socialLinks.innerHTML += `<a href="${config.pinterest.url}" target="_blank" rel="noopener" class="hover:opacity-80 transition hover:scale-110 transform" title="Pinterest"><img src="images/icon_pinterest.png" alt="Pinterest" class="w-10 h-10"></a>`;
        }
    }
}
