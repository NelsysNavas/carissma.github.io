function cargarFormularioPagos() {
    const config = getPagosConfig();

    Object.keys(config).forEach(metodo => {
        const mConfig = config[metodo];
        const toggle = document.getElementById(`pago-${metodo}-toggle`);
        const status = document.getElementById(`pago-${metodo}-status`);
        const content = document.getElementById(`pago-${metodo}-content`);

        if (toggle) {
            if (mConfig.activo) toggle.classList.add('active');
            else toggle.classList.remove('active');
        }
        if (status) {
            if (mConfig.activo) {
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
            if (mConfig.activo) {
                content.classList.remove('opacity-40', 'pointer-events-none');
            } else {
                content.classList.add('opacity-40', 'pointer-events-none');
            }
        }

        if (metodo === 'pago_movil') {
            setVal('pago-pm-banco', mConfig.banco);
            setVal('pago-pm-cedula', mConfig.cedula);
            setVal('pago-pm-telefono', mConfig.telefono);
            setVal('pago-pm-beneficiario', mConfig.beneficiario);
        } else if (metodo === 'transferencia') {
            setVal('pago-tf-banco', mConfig.banco);
            setVal('pago-tf-cuenta', mConfig.cuenta);
            setVal('pago-tf-titular', mConfig.titular);
            setVal('pago-tf-cedula', mConfig.cedula);
        } else if (metodo === 'zelle') {
            setVal('pago-zelle-email', mConfig.email);
            setVal('pago-zelle-nombre', mConfig.nombre);
        } else if (metodo === 'paypal') {
            setVal('pago-paypal-email', mConfig.email);
        } else if (metodo === 'efectivo') {
            setVal('pago-efectivo-mensaje', mConfig.mensaje);
        }
    });
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

function togglePagoActivo(metodo) {
    const toggle = document.getElementById(`pago-${metodo}-toggle`);
    const status = document.getElementById(`pago-${metodo}-status`);
    const content = document.getElementById(`pago-${metodo}-content`);
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

function toggleAcordeon(metodo) {
    const content = document.getElementById(`acordeon-${metodo}`);
    const chevron = document.getElementById(`chevron-${metodo}`);
    if (!content) return;

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
}

function guardarConfiguracionPagos() {
    const config = {
        pago_movil: {
            activo: document.getElementById('pago-pago_movil-toggle').classList.contains('active'),
            banco: document.getElementById('pago-pm-banco').value.trim() || DEFAULT_PAGOS_CONFIG.pago_movil.banco,
            cedula: document.getElementById('pago-pm-cedula').value.trim() || DEFAULT_PAGOS_CONFIG.pago_movil.cedula,
            telefono: document.getElementById('pago-pm-telefono').value.trim() || DEFAULT_PAGOS_CONFIG.pago_movil.telefono,
            beneficiario: document.getElementById('pago-pm-beneficiario').value.trim() || DEFAULT_PAGOS_CONFIG.pago_movil.beneficiario
        },
        transferencia: {
            activo: document.getElementById('pago-transferencia-toggle').classList.contains('active'),
            banco: document.getElementById('pago-tf-banco').value.trim() || DEFAULT_PAGOS_CONFIG.transferencia.banco,
            cuenta: document.getElementById('pago-tf-cuenta').value.trim() || DEFAULT_PAGOS_CONFIG.transferencia.cuenta,
            titular: document.getElementById('pago-tf-titular').value.trim() || DEFAULT_PAGOS_CONFIG.transferencia.titular,
            cedula: document.getElementById('pago-tf-cedula').value.trim() || DEFAULT_PAGOS_CONFIG.transferencia.cedula
        },
        zelle: {
            activo: document.getElementById('pago-zelle-toggle').classList.contains('active'),
            email: document.getElementById('pago-zelle-email').value.trim() || DEFAULT_PAGOS_CONFIG.zelle.email,
            nombre: document.getElementById('pago-zelle-nombre').value.trim() || DEFAULT_PAGOS_CONFIG.zelle.nombre
        },
        paypal: {
            activo: document.getElementById('pago-paypal-toggle').classList.contains('active'),
            email: document.getElementById('pago-paypal-email').value.trim() || DEFAULT_PAGOS_CONFIG.paypal.email
        },
        efectivo: {
            activo: document.getElementById('pago-efectivo-toggle').classList.contains('active'),
            mensaje: document.getElementById('pago-efectivo-mensaje').value.trim() || DEFAULT_PAGOS_CONFIG.efectivo.mensaje
        }
    };

    savePagosConfig(config);

    if (typeof actualizarOpcionesPago === 'function') {
        actualizarOpcionesPago();
    }

    mostrarMensajePagos('exito', '✅ Configuración de métodos de pago guardada');
}

function mostrarMensajePagos(tipo, mensaje) {
    const div = document.getElementById('pagos-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}
