let contenidoTabActual = 'terminos';

function cargarContenidoActivo() {
    contenidoTabActual = 'terminos';
    cargarTabContenido();
}

function cambiarTabContenido(tab) {
    contenidoTabActual = tab;
    cargarTabContenido();
}

function cargarTabContenido() {
    const config = getContenidoConfig();
    const data = config[contenidoTabActual];
    if (!data) return;

    ['terminos', 'privacidad', 'devoluciones'].forEach(t => {
        const tabBtn = document.getElementById(`tab-contenido-${t}`);
        if (tabBtn) {
            if (t === contenidoTabActual) {
                tabBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white cursor-pointer';
            } else {
                tabBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white cursor-pointer';
            }
        }
        const seccion = document.getElementById(`seccion-contenido-${t}`);
        if (seccion) {
            if (t === contenidoTabActual) {
                seccion.classList.remove('hidden');
            } else {
                seccion.classList.add('hidden');
            }
        }
    });

    const tituloEl = document.getElementById(`contenido-${contenidoTabActual}-titulo`);
    if (tituloEl) tituloEl.value = data.titulo || '';

    const fechaEl = document.getElementById(`contenido-${contenidoTabActual}-fecha`);
    if (fechaEl) fechaEl.value = data.ultimaActualizacion || '';

    renderSeccionesContenido();
}

function renderSeccionesContenido() {
    const container = document.getElementById(`secciones-contenido-${contenidoTabActual}`);
    if (!container) return;

    const config = getContenidoConfig();
    const data = config[contenidoTabActual];
    if (!data || !data.secciones) return;

    container.innerHTML = '';

    data.secciones.forEach((seccion, idx) => {
        const div = document.createElement('div');
        div.className = 'bg-zinc-800 p-4 rounded-xl border border-zinc-700 mb-3';
        div.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <input type="text" value="${escapeHtml(seccion.titulo)}" onchange="actualizarSeccionContenido('${seccion.id}', 'titulo', this.value)" class="flex-1 px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="Título de la sección">
                <button onclick="eliminarSeccionContenido('${seccion.id}')" class="ml-2 text-zinc-500 hover:text-red-400 transition p-2" title="Eliminar sección">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>
                </button>
            </div>
            <div class="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                <div class="flex flex-wrap gap-1 p-2 border-b border-zinc-700 bg-zinc-800">
                    <select onchange="formatTextContenido('formatBlock', this.value); this.selectedIndex=0;" class="px-2 py-1 rounded text-white bg-zinc-700 text-xs cursor-pointer">
                        <option value="">Normal</option>
                        <option value="h3">Título H3</option>
                        <option value="h4">Subtítulo H4</option>
                        <option value="blockquote">Cita</option>
                        <option value="pre">Código</option>
                    </select>
                    <button type="button" onclick="formatTextContenido('bold')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs font-bold">B</button>
                    <button type="button" onclick="formatTextContenido('italic')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs italic">I</button>
                    <button type="button" onclick="formatTextContenido('underline')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs underline">U</button>
                    <button type="button" onclick="formatTextContenido('insertUnorderedList')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs">• Lista</button>
                    <button type="button" onclick="formatTextContenido('insertOrderedList')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs">1. Lista</button>
                    <button type="button" onclick="formatTextContenido('formatBlock', 'blockquote')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs">"</button>
                    <button type="button" onclick="formatTextContenido('createLink', prompt('URL:'))" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs">🔗</button>
                    <button type="button" onclick="formatTextContenido('removeFormat')" class="px-2 py-1 rounded text-white hover:bg-zinc-700 text-xs">⌫</button>
                </div>
                <div id="editor-${seccion.id}" contenteditable="true" onblur="actualizarSeccionContenido('${seccion.id}', 'contenido', this.innerHTML)" class="min-h-[120px] p-3 text-zinc-200 text-sm leading-relaxed focus:outline-none" style="max-height: 300px; overflow-y: auto;">${seccion.contenido}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function formatTextContenido(command, value) {
    document.execCommand(command, false, value);
}

function agregarSeccionContenido() {
    const config = getContenidoConfig();
    const data = config[contenidoTabActual];
    if (!data) return;

    const nuevoId = 's' + Date.now();
    if (!data.secciones) data.secciones = [];
    data.secciones.push({
        id: nuevoId,
        titulo: `${data.secciones.length + 1}. Nueva sección`,
        contenido: 'Escribe aquí el contenido...'
    });
    saveContenidoConfig(config);
    renderSeccionesContenido();
}

function eliminarSeccionContenido(id) {
    if (!confirm('¿Eliminar esta sección?')) return;
    const config = getContenidoConfig();
    const data = config[contenidoTabActual];
    if (!data || !data.secciones) return;

    data.secciones = data.secciones.filter(s => s.id !== id);
    saveContenidoConfig(config);
    renderSeccionesContenido();
}

function actualizarSeccionContenido(id, campo, valor) {
    const config = getContenidoConfig();
    const data = config[contenidoTabActual];
    if (!data || !data.secciones) return;

    const seccion = data.secciones.find(s => s.id === id);
    if (seccion) {
        seccion[campo] = valor;
        saveContenidoConfig(config);
    }
}

function guardarConfiguracionContenido() {
    const config = getContenidoConfig();
    config[contenidoTabActual].titulo = document.getElementById(`contenido-${contenidoTabActual}-titulo`).value.trim();
    config[contenidoTabActual].ultimaActualizacion = document.getElementById(`contenido-${contenidoTabActual}-fecha`).value.trim();
    saveContenidoConfig(config);

    const mensaje = document.getElementById('contenido-message');
    if (mensaje) {
        mensaje.className = 'mt-4 p-3 rounded-xl text-sm font-medium bg-green-50 text-green-800 border border-green-200';
        mensaje.textContent = '✅ Contenido guardado correctamente. Los cambios se reflejarán en la página del front.';
        mensaje.classList.remove('hidden');
        setTimeout(() => mensaje.classList.add('hidden'), 5000);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
