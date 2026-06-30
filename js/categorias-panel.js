let categoriasData = [];
let categoriaEditandoId = null;

async function cargarCategoriasPanel() {
    categoriasData = await getCategorias();
    renderListaCategorias();
    cargarSelectCategoriasAdmin();
}

function renderListaCategorias() {
    const container = document.getElementById('lista-categorias');
    if (!container) return;

    if (categoriasData.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-sm text-center py-8">No hay categorías. Crea la primera con el botón de arriba.</p>';
        return;
    }

    container.innerHTML = '';
    categoriasData.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-4';
        const estadoBadge = cat.activo !== false
            ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase">Activo</span>'
            : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-700 text-zinc-400 uppercase">Inactivo</span>';
        div.innerHTML = `
            ${cat.imagen ? `<img src="${cat.imagen}" alt="${cat.nombre}" class="w-16 h-16 rounded-lg object-cover">` : '<div class="w-16 h-16 rounded-lg bg-zinc-700 flex items-center justify-center text-2xl text-zinc-500">📁</div>'}
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h4 class="text-white font-semibold text-sm truncate">${cat.nombre}</h4>
                    ${estadoBadge}
                </div>
                <p class="text-zinc-500 text-xs mt-1">Slug: <code class="text-orange-400">${cat.slug}</code></p>
                <p class="text-zinc-400 text-xs mt-1 truncate">${cat.descripcion || 'Sin descripción'}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="toggleCategoriaActiva('${cat.id}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${cat.activo !== false ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'}" title="Activar/Desactivar">
                    ${cat.activo !== false ? '✓' : '○'}
                </button>
                <button onclick="editarCategoria('${cat.id}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition bg-blue-600 hover:bg-blue-700 text-white">
                    Editar
                </button>
                <button onclick="eliminarCategoria('${cat.id}')" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition bg-red-600 hover:bg-red-700 text-white">
                    Eliminar
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

function cargarSelectCategoriasAdmin() {
    const select = document.getElementById('product-category');
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccionar</option>';
    categoriasData.forEach(cat => {
        if (cat.activo !== false) {
            const opt = document.createElement('option');
            opt.value = cat.nombre;
            opt.textContent = cat.nombre;
            select.appendChild(opt);
        }
    });
    if (valorActual) {
        select.value = valorActual;
    }
}

function mostrarFormCategoria() {
    const form = document.getElementById('form-categoria');
    if (form) form.classList.remove('hidden');
    const btn = document.getElementById('btn-nueva-categoria');
    if (btn) btn.classList.add('hidden');
    document.getElementById('categoria-nombre').focus();
}

function cancelarFormCategoria() {
    const form = document.getElementById('form-categoria');
    if (form) form.classList.add('hidden');
    const btn = document.getElementById('btn-nueva-categoria');
    if (btn) btn.classList.remove('hidden');
    limpiarFormCategoria();
    categoriaEditandoId = null;
}

function limpiarFormCategoria() {
    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-nombre').value = '';
    document.getElementById('categoria-slug').value = '';
    document.getElementById('categoria-descripcion').value = '';
    document.getElementById('categoria-imagen').value = '';
    const preview = document.getElementById('categoria-imagen-preview');
    if (preview) preview.src = '';
    document.getElementById('categoria-form-titulo').textContent = 'Nueva Categoría';
}

function editarCategoria(id) {
    const cat = categoriasData.find(c => c.id === id);
    if (!cat) return;

    categoriaEditandoId = id;
    document.getElementById('categoria-id').value = cat.id;
    document.getElementById('categoria-nombre').value = cat.nombre || '';
    document.getElementById('categoria-slug').value = cat.slug || '';
    document.getElementById('categoria-descripcion').value = cat.descripcion || '';
    document.getElementById('categoria-imagen').value = cat.imagen || '';
    const preview = document.getElementById('categoria-imagen-preview');
    if (preview) preview.src = cat.imagen || '';
    document.getElementById('categoria-activo').checked = cat.activo !== false;
    document.getElementById('categoria-form-titulo').textContent = 'Editar: ' + cat.nombre;

    mostrarFormCategoria();
    window.scrollTo({ top: document.getElementById('form-categoria').offsetTop - 100, behavior: 'smooth' });
}

async function guardarCategoria() {
    const nombre = document.getElementById('categoria-nombre').value.trim();
    let slug = document.getElementById('categoria-slug').value.trim();
    const descripcion = document.getElementById('categoria-descripcion').value.trim();
    const imagen = document.getElementById('categoria-imagen').value.trim();
    const activo = document.getElementById('categoria-activo').checked;

    if (!nombre) {
        alert('⚠️ El nombre es obligatorio');
        return;
    }

    if (!slug) {
        slug = generarSlug(nombre);
    }

    const data = {
        nombre,
        slug,
        descripcion,
        imagen,
        activo,
        fechaActualizacion: new Date().toISOString()
    };

    try {
        if (categoriaEditandoId) {
            await db.collection('categorias').doc(categoriaEditandoId).update(data);
        } else {
            const nuevoId = generarSlug(nombre) + '-' + Date.now().toString(36);
            data.fechaCreacion = new Date().toISOString();
            await db.collection('categorias').doc(nuevoId).set(data);
        }

        localStorage.removeItem('carissma_categorias');
        await cargarCategoriasPanel();
        cancelarFormCategoria();
        mostrarMensajeCategorias('exito', '✅ Categoría guardada correctamente');
    } catch (error) {
        mostrarMensajeCategorias('error', '❌ Error: ' + error.message);
    }
}

async function eliminarCategoria(id) {
    const cat = categoriasData.find(c => c.id === id);
    if (!cat) return;

    const productosEnCategoria = await FirebaseService.getProductos();
    const productosAfectados = productosEnCategoria.filter(p => p.categoria === cat.nombre);

    let mensaje = `¿Eliminar la categoría "${cat.nombre}"?`;
    if (productosAfectados.length > 0) {
        mensaje += `\n\n⚠️ ADVERTENCIA: Hay ${productosAfectados.length} producto(s) usando esta categoría. Quedarán sin categoría asignada.`;
    }

    if (!confirm(mensaje)) return;

    try {
        await db.collection('categorias').doc(id).delete();
        localStorage.removeItem('carissma_categorias');
        await cargarCategoriasPanel();
        mostrarMensajeCategorias('exito', '✅ Categoría eliminada');
    } catch (error) {
        mostrarMensajeCategorias('error', '❌ Error: ' + error.message);
    }
}

async function toggleCategoriaActiva(id) {
    const cat = categoriasData.find(c => c.id === id);
    if (!cat) return;

    const nuevoEstado = cat.activo === false;
    try {
        await db.collection('categorias').doc(id).update({ activo: nuevoEstado });
        localStorage.removeItem('carissma_categorias');
        await cargarCategoriasPanel();
    } catch (error) {
        mostrarMensajeCategorias('error', '❌ Error: ' + error.message);
    }
}

async function subirImagenCategoria(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('❌ Formato no válido. Solo JPG, PNG o WebP');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ La imagen excede 5MB');
        return;
    }

    const progress = document.getElementById('categoria-upload-progress');
    if (progress) progress.classList.remove('hidden');

    try {
        const result = await CloudinaryService.uploadImage(file);
        document.getElementById('categoria-imagen').value = result.url;
        const preview = document.getElementById('categoria-imagen-preview');
        if (preview) preview.src = result.url;
        if (progress) progress.classList.add('hidden');
    } catch (error) {
        if (progress) progress.classList.add('hidden');
        alert('❌ Error: ' + error.message);
    }
    event.target.value = '';
}

function mostrarMensajeCategorias(tipo, mensaje) {
    const div = document.getElementById('categorias-message');
    if (!div) return;
    div.className = 'mt-4 p-3 rounded-xl text-sm font-medium ' +
        (tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200');
    div.textContent = mensaje;
    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('categoria-nombre');
    if (nombreInput) {
        nombreInput.addEventListener('input', function() {
            const slugInput = document.getElementById('categoria-slug');
            if (slugInput && !slugInput.dataset.touched) {
                slugInput.value = generarSlug(this.value);
            }
        });
        const slugInput = document.getElementById('categoria-slug');
        if (slugInput) {
            slugInput.addEventListener('input', function() {
                this.dataset.touched = 'true';
            });
        }
    }
});
