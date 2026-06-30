function cargarFormularioFirebase() {
    const config = getFirebaseConfig();
    document.getElementById('fb-apiKey').value = config.apiKey || '';
    document.getElementById('fb-authDomain').value = config.authDomain || '';
    document.getElementById('fb-projectId').value = config.projectId || '';
    document.getElementById('fb-storageBucket').value = config.storageBucket || '';
    document.getElementById('fb-messagingSenderId').value = config.messagingSenderId || '';
    document.getElementById('fb-appId').value = config.appId || '';
    verificarEstadoFirebase();
}

async function verificarEstadoFirebase() {
    const statusIcon = document.getElementById('firebase-status-icon');
    const statusText = document.getElementById('firebase-status-text');
    const statusDetail = document.getElementById('firebase-status-detail');
    const sidebarDot = document.getElementById('firebase-status-dot');

    if (!statusIcon) return;

    statusIcon.className = 'w-3 h-3 rounded-full bg-yellow-500 animate-pulse';
    statusText.textContent = 'Verificando conexión...';
    statusText.className = 'text-sm font-semibold text-gray-700';
    statusDetail.textContent = 'Comprobando acceso a Firestore...';

    try {
        const testDoc = await db.collection('_test_connection').doc('test').get();
        statusIcon.className = 'w-3 h-3 rounded-full bg-green-500';
        statusText.textContent = 'Conectado a Firebase';
        statusText.className = 'text-sm font-semibold text-green-700';
        statusDetail.textContent = 'Base de datos operativa - ' + getFirebaseConfig().projectId;
        if (sidebarDot) sidebarDot.className = 'ml-auto w-2 h-2 rounded-full bg-green-500';
    } catch (error) {
        statusIcon.className = 'w-3 h-3 rounded-full bg-red-500';
        statusText.textContent = 'Error de conexión';
        statusText.className = 'text-sm font-semibold text-red-700';
        statusDetail.textContent = 'Revisa las credenciales y las reglas de Firestore';
        if (sidebarDot) sidebarDot.className = 'ml-auto w-2 h-2 rounded-full bg-red-500';
        console.error('Error Firebase:', error);
    }
}

function guardarYSincronizarFirebase() {
    const config = {
        apiKey: document.getElementById('fb-apiKey').value.trim(),
        authDomain: document.getElementById('fb-authDomain').value.trim(),
        projectId: document.getElementById('fb-projectId').value.trim(),
        storageBucket: document.getElementById('fb-storageBucket').value.trim(),
        messagingSenderId: document.getElementById('fb-messagingSenderId').value.trim(),
        appId: document.getElementById('fb-appId').value.trim()
    };

    if (!config.apiKey || !config.projectId) {
        mostrarMensajeFirebase('error', '⚠️ Faltan campos obligatorios (Api Key y Project ID)');
        return;
    }

    try {
        localStorage.setItem('carissma_firebase_config', JSON.stringify(config));
        mostrarMensajeFirebase('exito', '✅ Credenciales guardadas. Reiniciando conexión...');

        setTimeout(() => {
            if (initializeFirebase()) {
                cargarDatosAdmin().then(() => {
                    renderDashboard();
                    renderProductsTable();
                    renderOrdersTable();
                    renderClientsTable();
                    verificarEstadoFirebase();
                    mostrarMensajeFirebase('exito', '🎉 ¡Conectado exitosamente! Datos sincronizados desde Firebase.');
                });
            }
        }, 800);
    } catch (error) {
        mostrarMensajeFirebase('error', '❌ Error al guardar: ' + error.message);
    }
}

function limpiarConfigFirebase() {
    if (!confirm('¿Restaurar las credenciales por defecto?\n\nSe perderá la configuración personalizada.')) return;
    localStorage.removeItem('carissma_firebase_config');
    initializeFirebase();
    cargarFormularioFirebase();
    cargarDatosAdmin().then(() => {
        renderDashboard();
        renderProductsTable();
        renderOrdersTable();
        renderClientsTable();
    });
    mostrarMensajeFirebase('exito', '🔄 Credenciales restauradas al proyecto por defecto');
}

function mostrarMensajeFirebase(tipo, mensaje) {
    const div = document.getElementById('firebase-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(verificarEstadoFirebase, 1000);
});
