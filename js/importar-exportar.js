async function exportarDatosJSON() {
    try {
        const data = {
            version: '1.0',
            fechaExport: new Date().toISOString(),
            appName: 'Carissma',
            productos: [],
            contenido: {},
            configuracion: {}
        };

        try {
            const productosSnap = await db.collection('productos').get();
            productosSnap.forEach(doc => {
                data.productos.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.warn('No se pudieron exportar productos de Firebase, usando local');
            const local = JSON.parse(localStorage.getItem('carissma_products') || '[]');
            data.productos = local;
        }

        const collections = ['configuracion', 'redes', 'nosotros', 'pagos', 'afiliados', 'seo', 'social'];
        for (const col of collections) {
            try {
                const snap = await db.collection(col).get();
                snap.forEach(doc => {
                    data.configuracion[doc.id] = doc.data();
                });
            } catch (e) {
                console.warn(`No se pudo exportar ${col}`);
            }
        }

        const configKeys = ['carissma_social_config', 'carissma_nosotros_config', 'carissma_pagos_config', 'carissma_affiliates_config', 'carissma_seo_config', 'carissma_emailjs_config', 'carissma_cloudinary_config', 'carissma_firebase_config'];
        configKeys.forEach(key => {
            const local = localStorage.getItem(key);
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    if (!data.configuracion[key]) {
                        data.configuracion[key] = parsed;
                    }
                } catch (e) {}
            }
        });

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const fecha = new Date().toISOString().split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `carissma_backup_${fecha}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        mostrarMensajeImportar('exito', `✅ Datos exportados correctamente. ${data.productos.length} productos, ${Object.keys(data.configuracion).length} configuraciones.`);
    } catch (error) {
        mostrarMensajeImportar('error', `❌ Error al exportar: ${error.message}`);
    }
}

function validarEstructuraJSON(data) {
    const errores = [];

    if (!data || typeof data !== 'object') {
        errores.push('El archivo no es un JSON válido');
        return errores;
    }

    if (!data.appName) {
        errores.push('Falta el campo "appName" (debe ser "Carissma")');
    } else if (data.appName !== 'Carissma') {
        errores.push(`El archivo es de "${data.appName}", no de Carissma`);
    }

    if (data.productos !== undefined && !Array.isArray(data.productos)) {
        errores.push('El campo "productos" debe ser un array');
    } else if (Array.isArray(data.productos)) {
        data.productos.forEach((p, idx) => {
            if (!p.nombre) errores.push(`Producto #${idx + 1}: falta el campo "nombre"`);
            if (p.precio === undefined) errores.push(`Producto #${idx + 1}: falta el campo "precio"`);
            if (p.categoria === undefined) errores.push(`Producto #${idx + 1}: falta el campo "categoria"`);
        });
    }

    if (data.configuracion !== undefined && typeof data.configuracion !== 'object') {
        errores.push('El campo "configuracion" debe ser un objeto');
    }

    return errores;
}

function leerArchivoJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('El archivo no es un JSON válido: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
        reader.readAsText(file);
    });
}

async function importarDatosJSON(file) {
    try {
        const data = await leerArchivoJSON(file);

        const errores = validarEstructuraJSON(data);
        if (errores.length > 0) {
            mostrarMensajeImportar('error', `❌ Archivo inválido:\n• ${errores.join('\n• ')}`);
            return;
        }

        if (!confirm(`¿Deseas importar los datos?\n\n📦 ${data.productos?.length || 0} productos\n⚙️ ${Object.keys(data.configuracion || {}).length} configuraciones\n\nLos datos se agregarán a Firebase y localStorage.`)) {
            return;
        }

        let stats = { productosImportados: 0, productosSobrescritos: 0, productosOmitidos: 0, errores: 0 };

        if (data.productos && data.productos.length > 0) {
            for (const producto of data.productos) {
                try {
                    const { id, ...data } = producto;
                    let idFinal = id;

                    if (id) {
                        const existe = await verificarProductoExiste(id);
                        if (existe) {
                            const accion = await mostrarDialogoDuplicado(producto.nombre, id);
                            if (accion === 'cancelar') {
                                stats.productosOmitidos++;
                                continue;
                            } else if (accion === 'nuevo') {
                                idFinal = generarNuevoId(producto);
                                stats.productosImportados++;
                            } else if (accion === 'sobrescribir') {
                                await db.collection('productos').doc(id).set(data);
                                stats.productosSobrescritos++;
                                continue;
                            }
                        } else {
                            stats.productosImportados++;
                        }
                    } else {
                        stats.productosImportados++;
                    }

                    if (idFinal) {
                        await db.collection('productos').doc(idFinal).set(data);
                    }
                } catch (error) {
                    console.error('Error importando producto:', error);
                    stats.errores++;
                }
            }
        }

        if (data.configuracion && Object.keys(data.configuracion).length > 0) {
            for (const [key, value] of Object.entries(data.configuracion)) {
                try {
                    if (key.startsWith('carissma_') && key.endsWith('_config')) {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        await db.collection('configuracion').doc(key).set(value);
                    }
                } catch (error) {
                    console.error(`Error importando config ${key}:`, error);
                }
            }
        }

        if (data.productos && data.productos.length > 0) {
            localStorage.setItem('carissma_products', JSON.stringify(data.productos));
        }

        let resumen = `✅ Importación completada:\n`;
        resumen += `• ${stats.productosImportados} productos nuevos\n`;
        resumen += `• ${stats.productosSobrescritos} productos sobrescritos\n`;
        if (stats.productosOmitidos > 0) resumen += `• ${stats.productosOmitidos} productos omitidos\n`;
        if (stats.errores > 0) resumen += `• ${stats.errores} errores\n`;
        resumen += `\nRecarga la página para ver los cambios.`;

        mostrarMensajeImportar('exito', resumen);

        setTimeout(() => {
            if (typeof cargarDatosAdmin === 'function') {
                cargarDatosAdmin().then(() => {
                    renderDashboard();
                    renderProductsTable();
                });
            }
        }, 2000);
    } catch (error) {
        mostrarMensajeImportar('error', `❌ Error al importar: ${error.message}`);
    }
}

async function verificarProductoExiste(id) {
    try {
        const doc = await db.collection('productos').doc(id).get();
        return doc.exists;
    } catch (error) {
        return false;
    }
}

function generarNuevoId(producto) {
    const categoria = (producto.categoria || 'prod').toLowerCase().replace(/\s+/g, '-').substring(0, 3);
    const random = Math.random().toString(36).substring(2, 7);
    return `${categoria}-${Date.now().toString(36)}-${random}`;
}

function mostrarDialogoDuplicado(nombre, id) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70';
        modal.innerHTML = `
            <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full">
                <h3 class="text-lg font-bold text-white mb-3">⚠️ Producto duplicado</h3>
                <p class="text-sm text-zinc-300 mb-2">El producto <strong class="text-orange-400">"${nombre}"</strong> ya existe con el ID <code class="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">${id}</code></p>
                <p class="text-xs text-zinc-500 mb-5">¿Qué deseas hacer?</p>
                <div class="flex flex-col gap-2">
                    <button id="dup-sobrescribir" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                        🔄 Sobrescribir (reemplazar datos existentes)
                    </button>
                    <button id="dup-nuevo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                        ➕ Crear como nuevo (con ID diferente)
                    </button>
                    <button id="dup-cancelar" class="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
                        ❌ Omitir este producto
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#dup-sobrescribir').onclick = () => { modal.remove(); resolve('sobrescribir'); };
        modal.querySelector('#dup-nuevo').onclick = () => { modal.remove(); resolve('nuevo'); };
        modal.querySelector('#dup-cancelar').onclick = () => { modal.remove(); resolve('cancelar'); };
    });
}

function setupDropZone() {
    const dropZone = document.getElementById('import-drop-zone');
    const fileInput = document.getElementById('import-file-input');
    if (!dropZone || !fileInput) return;

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) importarDatosJSON(e.target.files[0]);
    });

    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('border-orange-500', 'bg-orange-50\/10');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('border-orange-500', 'bg-orange-50\/10');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) importarDatosJSON(files[0]);
    });
}

function mostrarMensajeImportar(tipo, mensaje) {
    const div = document.getElementById('importar-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium whitespace-pre-line ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    if (tipo === 'exito') {
        setTimeout(() => div.classList.add('hidden'), 15000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupDropZone();
});
