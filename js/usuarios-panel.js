let usuariosData = [];
let usuarioEditandoUid = null;

async function cargarUsuariosPanel() {
    try {
        const snap = await db.collection('usuarios').orderBy('fechaCreacion', 'asc').get();
        usuariosData = [];
        snap.forEach(doc => {
            usuariosData.push({ uid: doc.id, ...doc.data() });
        });
        renderListaUsuarios();
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

function renderListaUsuarios() {
    const container = document.getElementById('lista-usuarios');
    if (!container) return;

    if (usuariosData.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-sm text-center py-8">No hay usuarios.</p>';
        return;
    }

    container.innerHTML = '';
    usuariosData.forEach(user => {
        const div = document.createElement('div');
        div.className = 'bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4';
        const roleBadge = user.role === 'super_admin'
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 uppercase">Super Admin</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">Admin</span>';
        const estadoBadge = user.activo !== false
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase">Activo</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-700 text-zinc-400 uppercase">Inactivo</span>';
        const isSuper = user.role === 'super_admin';
        div.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                ${(user.displayName || user.email).charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h4 class="text-white font-semibold text-sm truncate">${user.displayName || 'Sin nombre'}</h4>
                    ${roleBadge}
                    ${estadoBadge}
                </div>
                <p class="text-zinc-500 text-xs mt-1 truncate">${user.email}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                ${!isSuper ? `<button onclick="toggleUsuarioActivo('${user.uid}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${user.activo !== false ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}" title="Activar/Desactivar">
                    ${user.activo !== false ? '✓' : '○'}
                </button>` : ''}
                <button onclick="editarUsuario('${user.uid}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition bg-blue-600 hover:bg-blue-700 text-white">
                    Editar
                </button>
                ${!isSuper ? `<button onclick="eliminarUsuario('${user.uid}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition bg-red-600 hover:bg-red-700 text-white">
                    Eliminar
                </button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function mostrarFormUsuario() {
    const form = document.getElementById('form-usuario');
    if (form) form.classList.remove('hidden');
    const btn = document.getElementById('btn-nuevo-usuario');
    if (btn) btn.classList.add('hidden');
    document.getElementById('usuario-nombre').focus();
}

function cancelarFormUsuario() {
    const form = document.getElementById('form-usuario');
    if (form) form.classList.add('hidden');
    const btn = document.getElementById('btn-nuevo-usuario');
    if (btn) btn.classList.remove('hidden');
    limpiarFormUsuario();
    usuarioEditandoUid = null;
}

function limpiarFormUsuario() {
    document.getElementById('usuario-uid').value = '';
    document.getElementById('usuario-email').value = '';
    document.getElementById('usuario-email').disabled = false;
    document.getElementById('usuario-password').value = '';
    document.getElementById('usuario-password').required = true;
    document.getElementById('usuario-nombre').value = '';
    document.getElementById('usuario-activo').checked = true;
    document.getElementById('usuario-form-titulo').textContent = 'Nuevo Usuario';
    document.getElementById('usuario-password-label').textContent = 'Contraseña *';
}

function editarUsuario(uid) {
    const user = usuariosData.find(u => u.uid === uid);
    if (!user) return;

    usuarioEditandoUid = uid;
    document.getElementById('usuario-uid').value = user.uid;
    document.getElementById('usuario-email').value = user.email || '';
    document.getElementById('usuario-email').disabled = true;
    document.getElementById('usuario-password').value = '';
    document.getElementById('usuario-password').required = false;
    document.getElementById('usuario-nombre').value = user.displayName || '';
    document.getElementById('usuario-activo').checked = user.activo !== false;
    document.getElementById('usuario-form-titulo').textContent = 'Editar: ' + (user.displayName || user.email);
    document.getElementById('usuario-password-label').textContent = 'Nueva Contraseña (dejar vacío para no cambiar)';

    mostrarFormUsuario();
    window.scrollTo({ top: document.getElementById('form-usuario').offsetTop - 100, behavior: 'smooth' });
}

async function guardarUsuario() {
    const email = document.getElementById('usuario-email').value.trim();
    const password = document.getElementById('usuario-password').value;
    const displayName = document.getElementById('usuario-nombre').value.trim();
    const activo = document.getElementById('usuario-activo').checked;

    if (!displayName) {
        alert('⚠️ El nombre es obligatorio');
        return;
    }

    try {
        if (usuarioEditandoUid) {
            const updateData = { displayName, activo, fechaActualizacion: new Date().toISOString() };
            await db.collection('usuarios').doc(usuarioEditandoUid).update(updateData);
            if (password && password.length >= 6) {
                const currentUser = auth.currentUser;
                if (currentUser && currentUser.uid === usuarioEditandoUid) {
                    await currentUser.updatePassword(password);
                } else {
                    alert('⚠️ Solo puedes cambiar contraseñas desde el perfil de usuario actual. La contraseña no se actualizó.');
                }
            }
        } else {
            if (!email || !password) {
                alert('⚠️ Email y contraseña son obligatorios');
                return;
            }
            if (password.length < 6) {
                alert('⚠️ La contraseña debe tener al menos 6 caracteres');
                return;
            }
            const result = await registerUser(email, password, displayName, 'admin');
            if (!result.success) {
                alert('❌ ' + result.error);
                return;
            }
        }

        await cargarUsuariosPanel();
        cancelarFormUsuario();
        mostrarMensajeUsuarios('exito', '✅ Usuario guardado correctamente');
    } catch (error) {
        mostrarMensajeUsuarios('error', '❌ Error: ' + error.message);
    }
}

async function eliminarUsuario(uid) {
    const user = usuariosData.find(u => u.uid === uid);
    if (!user) return;

    if (!confirm('¿Eliminar al usuario "' + (user.displayName || user.email) + '"?\n\nEsto lo desactivará y no podrá iniciar sesión.')) return;

    try {
        await db.collection('usuarios').doc(uid).update({ activo: false, fechaEliminacion: new Date().toISOString() });
        await cargarUsuariosPanel();
        mostrarMensajeUsuarios('exito', '✅ Usuario desactivado');
    } catch (error) {
        mostrarMensajeUsuarios('error', '❌ Error: ' + error.message);
    }
}

async function toggleUsuarioActivo(uid) {
    const user = usuariosData.find(u => u.uid === uid);
    if (!user) return;

    const nuevoEstado = user.activo === false;
    try {
        await db.collection('usuarios').doc(uid).update({ activo: nuevoEstado });
        await cargarUsuariosPanel();
    } catch (error) {
        mostrarMensajeUsuarios('error', '❌ Error: ' + error.message);
    }
}

function mostrarMensajeUsuarios(tipo, mensaje) {
    const div = document.getElementById('usuarios-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

async function logoutDashboard() {
    if (!confirm('¿Cerrar sesión?')) return;
    await logout();
}
