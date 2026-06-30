const SUPER_ADMIN_EMAIL = 'nelsysnavas.music@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Carissma2026!';
const DEFAULT_AUTH_USERS = [
    {
        uid: 'super-admin',
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Nelsys Navas (Super Admin)',
        role: 'super_admin',
        activo: true,
        fechaCreacion: new Date().toISOString()
    }
];

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('carissma_current_user') || 'null');
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('carissma_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('carissma_current_user');
    }
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function isSuperAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'super_admin';
}

async function loginWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const fbUser = userCredential.user;
        const userDoc = await db.collection('usuarios').doc(fbUser.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email,
            role: 'admin',
            activo: true
        };
        if (!userData.activo) {
            await auth.signOut();
            return { success: false, error: 'Usuario desactivado. Contacta al administrador.' };
        }
        setCurrentUser(userData);
        return { success: true, user: userData };
    } catch (error) {
        console.error('Error en login:', error);
        let mensaje = 'Error al iniciar sesión';
        if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado';
        else if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta';
        else if (error.code === 'auth/invalid-email') mensaje = 'Email inválido';
        else if (error.code === 'auth/too-many-requests') mensaje = 'Demasiados intentos. Intenta más tarde.';
        return { success: false, error: mensaje };
    }
}

async function registerUser(email, password, displayName, role = 'admin') {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const fbUser = userCredential.user;
        const userData = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: displayName || fbUser.email,
            role: role,
            activo: true,
            fechaCreacion: new Date().toISOString()
        };
        await db.collection('usuarios').doc(fbUser.uid).set(userData);
        await fbUser.updateProfile({ displayName: displayName });
        return { success: true, user: userData };
    } catch (error) {
        console.error('Error al registrar:', error);
        let mensaje = 'Error al crear usuario';
        if (error.code === 'auth/email-already-in-use') mensaje = 'Este email ya está registrado';
        else if (error.code === 'auth/weak-password') mensaje = 'La contraseña debe tener al menos 6 caracteres';
        else if (error.code === 'auth/invalid-email') mensaje = 'Email inválido';
        return { success: false, error: mensaje };
    }
}

async function logout() {
    try {
        await auth.signOut();
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('carissma_current_user');
    window.location.href = 'login.html';
}

function protegerDashboard() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection('usuarios').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    setCurrentUser(doc.data());
                }
            });
        } else {
            if (!isAuthenticated()) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'dashboard.html' || currentPage === 'dashboard') {
                    window.location.href = 'login.html';
                }
            }
        }
    });

    if (!isAuthenticated() && !window.auth) {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'dashboard.html') {
            setTimeout(() => {
                if (!isAuthenticated()) {
                    window.location.href = 'login.html';
                }
            }, 1500);
        }
    }
}

async function inicializarSuperAdmin() {
    try {
        const usersRef = db.collection('usuarios');
        const allUsers = await usersRef.get();
        const superAdminDoc = await usersRef.doc('super-admin').get();

        if (!superAdminDoc.exists) {
            await usersRef.doc('super-admin').set(DEFAULT_AUTH_USERS[0]);
            console.log('✅ Documento de super admin creado en Firestore');
        }

        try {
            await auth.signInWithEmailAndPassword(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
            console.log('✅ Super admin verificado en Firebase Auth');
            await auth.signOut();
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                try {
                    await auth.createUserWithEmailAndPassword(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
                    console.log('✅ Super admin creado en Firebase Auth');
                    await auth.signOut();
                } catch (createErr) {
                    console.warn('⚠️ No se pudo crear super admin:', createErr.message);
                }
            } else {
                console.warn('⚠️ No se pudo verificar super admin:', e.message);
            }
        }
    } catch (error) {
        console.error('Error al inicializar super admin:', error);
    }
}
