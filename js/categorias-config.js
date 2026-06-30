const DEFAULT_CATEGORIAS = [
    { id: 'hecho-a-mano', nombre: 'Hecho a mano', slug: 'hecho-a-mano', descripcion: 'Artesanía local auténtica fabricada de manera tradicional y con amor.', imagen: '', activo: true },
    { id: 'curado', nombre: 'Curado', slug: 'curado', descripcion: 'Selección estricta de productos modernos elegidos por su diseño y calidad.', imagen: '', activo: true }
];

function getCategorias() {
    return new Promise(async (resolve) => {
        try {
            const local = localStorage.getItem('carissma_categorias');
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        resolve(parsed);
                        return;
                    }
                } catch (e) {}
            }
            const snap = await db.collection('categorias').orderBy('nombre').get();
            const cats = [];
            snap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
            if (cats.length === 0) {
                const seedSnap = await db.collection('categorias').get();
                if (seedSnap.empty) {
                    for (const cat of DEFAULT_CATEGORIAS) {
                        await db.collection('categorias').doc(cat.id).set(cat);
                        cats.push(cat);
                    }
                } else {
                    seedSnap.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
                }
            }
            localStorage.setItem('carissma_categorias', JSON.stringify(cats));
            resolve(cats);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            resolve(DEFAULT_CATEGORIAS);
        }
    });
}

function getCategoriaById(id) {
    return new Promise(async (resolve) => {
        const cats = await getCategorias();
        resolve(cats.find(c => c.id === id) || null);
    });
}

function getCategoriasActivas() {
    return new Promise(async (resolve) => {
        const cats = await getCategorias();
        resolve(cats.filter(c => c.activo !== false));
    });
}

function generarSlug(nombre) {
    return nombre.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
