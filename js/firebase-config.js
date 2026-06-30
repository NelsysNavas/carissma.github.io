const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDUJBPvjor5h-PCESw9tUVHhOSZLtD3wRU",
    authDomain: "carissma-store.firebaseapp.com",
    projectId: "carissma-store",
    storageBucket: "carissma-store.firebasestorage.app",
    messagingSenderId: "79891379840",
    appId: "1:79891379840:web:8615ba9b1e63ce3d6b1865"
};

function getFirebaseConfig() {
    const stored = localStorage.getItem('carissma_firebase_config');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parseando config guardada, usando default');
        }
    }
    return DEFAULT_FIREBASE_CONFIG;
}

let firebaseApp = null;
let db = null;
let auth = null;

function initializeFirebase() {
    try {
        if (firebaseApp) {
            firebaseApp.delete();
        }
        const config = getFirebaseConfig();
        firebaseApp = firebase.initializeApp(config);
        db = firebase.firestore();
        if (typeof firebase.auth === 'function') {
            try {
                auth = firebase.auth();
            } catch (e) {
                console.warn('Firebase Auth SDK no cargado');
                auth = null;
            }
        } else {
            auth = null;
        }
        console.log('Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        return false;
    }
}

initializeFirebase();
