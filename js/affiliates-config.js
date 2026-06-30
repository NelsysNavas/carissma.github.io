const DEFAULT_AFFILIATES_CONFIG = {
    coletilla: '* Precio referencial, puede variar según la tienda',
    botonTexto: 'Ir a Tienda Externa',
    tiendas: {
        Amazon: {
            activa: false,
            tag: '',
            terminos: 'Al adquirir productos a través de nuestros enlaces de afiliado, aceptas los términos y condiciones de Amazon. Las compras, devoluciones y políticas de precio son gestionadas directamente por Amazon. Los precios pueden variar sin previo aviso.'
        },
        Temu: {
            activa: false,
            tag: '',
            terminos: 'Al adquirir productos a través de nuestros enlaces de afiliado, aceptas los términos y condiciones de Temu. Las compras, devoluciones y políticas de precio son gestionadas directamente por Temu. Los precios pueden variar sin previo aviso.'
        },
        AliExpress: {
            activa: false,
            tag: '',
            terminos: 'Al adquirir productos a través de nuestros enlaces de afiliado, aceptas los términos y condiciones de AliExpress. Las compras, devoluciones y políticas de precio son gestionadas directamente por AliExpress. Los precios pueden variar sin previo aviso.'
        }
    }
};

function getAffiliatesConfig() {
    const stored = localStorage.getItem('carissma_affiliates_config');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const merged = {
                ...DEFAULT_AFFILIATES_CONFIG,
                ...parsed,
                tiendas: { ...DEFAULT_AFFILIATES_CONFIG.tiendas }
            };
            if (parsed.tiendas) {
                Object.keys(parsed.tiendas).forEach(tienda => {
                    merged.tiendas[tienda] = { ...merged.tiendas[tienda], ...parsed.tiendas[tienda] };
                });
            }
            return merged;
        } catch (e) {
            return DEFAULT_AFFILIATES_CONFIG;
        }
    }
    return DEFAULT_AFFILIATES_CONFIG;
}

function getTiendaConfig(nombreTienda) {
    const config = getAffiliatesConfig();
    return config.tiendas[nombreTienda] || { activa: false, tag: '', terminos: '' };
}

function isTiendaActiva(nombreTienda) {
    const tConfig = getTiendaConfig(nombreTienda);
    return tConfig.activa === true && tConfig.tag && tConfig.tag.trim() !== '';
}

function getTiendasActivas() {
    return ['Amazon', 'Temu', 'AliExpress'].filter(t => isTiendaActiva(t));
}

function cargarFormularioAfiliados() {
    const config = getAffiliatesConfig();
    document.getElementById('aff-coletilla').value = config.coletilla || DEFAULT_AFFILIATES_CONFIG.coletilla;
    document.getElementById('aff-boton-texto').value = config.botonTexto || DEFAULT_AFFILIATES_CONFIG.botonTexto;

    ['Amazon', 'Temu', 'AliExpress'].forEach(tienda => {
        const tConfig = config.tiendas[tienda] || { activa: false, tag: '', terminos: '' };
        const tagEl = document.getElementById(`aff-${tienda.toLowerCase()}-tag`);
        const terminosEl = document.getElementById(`aff-${tienda.toLowerCase()}-terminos`);

        if (tagEl) tagEl.value = tConfig.tag || '';
        if (terminosEl) terminosEl.value = tConfig.terminos || DEFAULT_AFFILIATES_CONFIG.tiendas[tienda].terminos;

        const activa = tConfig.activa === true;
        const toggle = document.getElementById(`toggle-${tienda.toLowerCase()}`);
        const status = document.getElementById(`status-${tienda.toLowerCase()}`);
        const content = document.getElementById(`content-${tienda.toLowerCase()}`);

        if (toggle) {
            if (activa) toggle.classList.add('active');
            else toggle.classList.remove('active');
        }
        if (status) {
            if (activa) {
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
            if (activa) {
                content.classList.remove('opacity-40', 'pointer-events-none');
            } else {
                content.classList.add('opacity-40', 'pointer-events-none');
            }
        }
    });
}

function toggleTiendaActiva(nombreTienda) {
    const key = nombreTienda.toLowerCase();
    const toggle = document.getElementById(`toggle-${key}`);
    const status = document.getElementById(`status-${key}`);
    const content = document.getElementById(`content-${key}`);
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

async function guardarConfiguracionAfiliados() {
    const config = {
        coletilla: document.getElementById('aff-coletilla').value.trim() || DEFAULT_AFFILIATES_CONFIG.coletilla,
        botonTexto: document.getElementById('aff-boton-texto').value.trim() || DEFAULT_AFFILIATES_CONFIG.botonTexto,
        tiendas: {}
    };

    ['Amazon', 'Temu', 'AliExpress'].forEach(tienda => {
        const key = tienda.toLowerCase();
        const tagEl = document.getElementById(`aff-${key}-tag`);
        const terminosEl = document.getElementById(`aff-${key}-terminos`);
        const toggle = document.getElementById(`toggle-${key}`);
        const activa = toggle ? toggle.classList.contains('active') : false;

        config.tiendas[tienda] = {
            activa: activa,
            tag: tagEl ? tagEl.value.trim() : '',
            terminos: terminosEl ? terminosEl.value.trim() : DEFAULT_AFFILIATES_CONFIG.tiendas[tienda].terminos
        };
    });

    localStorage.setItem('carissma_affiliates_config', JSON.stringify(config));

    try {
        await db.collection('configuracion').doc('afiliados').set(config);
        mostrarMensajeAfiliados('exito', '✅ Configuración guardada correctamente');
    } catch (error) {
        mostrarMensajeAfiliados('error', '⚠️ Guardado localmente. Error al sincronizar con Firebase: ' + error.message);
    }
}

function mostrarMensajeAfiliados(tipo, mensaje) {
    const div = document.getElementById('affiliados-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

function toggleAfiliadoFields() {
    const checkbox = document.getElementById('product-es-afiliado');
    const fields = document.getElementById('afiliado-fields');
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.classList.remove('hidden');
            actualizarSelectTiendas();
        } else {
            fields.classList.add('hidden');
        }
    }
}

function actualizarSelectTiendas() {
    const select = document.getElementById('product-tienda');
    if (!select) return;
    const valorActual = select.value;

    select.innerHTML = '<option value="">Seleccionar (opcional)</option>';
    getTiendasActivas().forEach(tienda => {
        const opt = document.createElement('option');
        opt.value = tienda;
        opt.textContent = tienda;
        select.appendChild(opt);
    });

    if (getTiendasActivas().includes(valorActual)) {
        select.value = valorActual;
    } else {
        select.value = '';
    }
}

function obtenerPrefijoTienda(nombreTienda) {
    const config = getTiendaConfig(nombreTienda);
    if (!config.tag) return '';
    const tag = config.tag.trim();
    if (nombreTienda === 'Amazon') return `?tag=${tag}`;
    if (nombreTienda === 'Temu') return `?affid=${tag}`;
    if (nombreTienda === 'AliExpress') return `?aff_fcid=${tag}`;
    return `?ref=${tag}`;
}

function autocompletarTagTienda() {
    const tienda = document.getElementById('product-tienda').value;
    const urlInput = document.getElementById('product-url-afiliado');

    if (!tienda) {
        alert('⚠️ Primero selecciona una tienda');
        return;
    }

    if (!isTiendaActiva(tienda)) {
        alert(`⚠️ La tienda ${tienda} no está activa. Actívala en la sección Afiliados del admin.`);
        return;
    }

    const config = getTiendaConfig(tienda);
    if (!config.tag) {
        alert(`⚠️ No has configurado tu tag de ${tienda} en la sección Afiliados del admin`);
        return;
    }

    if (!urlInput.value.trim()) {
        alert('⚠️ Primero pega el link del producto');
        return;
    }

    let url = urlInput.value.trim();
    url = url.split('?')[0].split('#')[0];

    const prefijo = obtenerPrefijoTienda(tienda);
    if (prefijo) {
        urlInput.value = url + prefijo;
        alert(`✅ Tag de ${tienda} agregado: ${prefijo}`);
    }
}

async function cargarColetillaPublica() {
    try {
        const doc = await db.collection('configuracion').doc('afiliados').get();
        if (doc.exists) {
            const data = doc.data();
            const el = document.getElementById('aff-coletilla-display');
            if (el) el.textContent = data.coletilla || DEFAULT_AFFILIATES_CONFIG.coletilla;
        }
    } catch (error) {
        const el = document.getElementById('aff-coletilla-display');
        if (el) el.textContent = getAffiliatesConfig().coletilla;
    }
}

function obtenerTerminosTienda(nombreTienda) {
    const config = getTiendaConfig(nombreTienda);
    return config.terminos || '';
}

function obtenerTiendasParaFront() {
    return getTiendasActivas();
}
