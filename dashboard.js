let products = [];
let orders = [];
let productFilter = 'todos';
let orderFilter = 'todos';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosAdmin();
    renderDashboard();
    renderProductsTable();
    renderOrdersTable();
    renderSalesChart();
    renderClientsTable();
});

async function cargarDatosAdmin() {
    try {
        products = await FirebaseService.getProductos();
        if (products.length === 0) {
            const defaultProducts = [
                { nombre: "Aretes de Mostacilla Tejidos", sku: "CAR-AM-01", precio: 20.00, categoria: "Hecho a mano", stock: 15, imagen: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop", descripcion: "Elegantes aretes confeccionados a mano por artesanos locales.", descripcionDetallada: "Patrón geométrico único, colores de temporada. Medidas: 4cm de largo. Materiales: mostacilla checa, hilo nylon.", destacado: true, estado: "Publicado" },
                { nombre: "Taza de Cerámica Rústica", sku: "CAR-CC-02", precio: 19.00, categoria: "Hecho a mano", stock: 12, imagen: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop", descripcion: "Hecha en torno de alfarero y esmaltada a mano.", descripcionDetallada: "Esmaltada con degradado en tonos arena y mar. Capacidad: 350ml. Apta para microondas y lavavajillas.", destacado: false, estado: "Publicado" },
                { nombre: "Set de Papelería Minimalista", sku: "CAR-PM-03", precio: 19.00, categoria: "Curado", stock: 20, imagen: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop", descripcion: "Set de escritura minimalista seleccionado cuidadosamente.", descripcionDetallada: "Incluye: libreta A5, bolígrafo roller, 3 plumas de dibujo, estuche de lino. Marcas premium.", destacado: false, estado: "Publicado" },
                { nombre: "Diario de Cuero Envejecido", sku: "CAR-DC-04", precio: 25.00, categoria: "Hecho a mano", stock: 8, imagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop", descripcion: "Libreta encuadernada artesanalmente con piel genuina.", descripcionDetallada: "Piel genuina curtida al sol. 200 páginas de papel de algodón reciclado. Encuadernación cosida a mano.", destacado: false, estado: "Publicado" },
                { nombre: "Vela de Soya Aromática", sku: "CAR-VA-05", precio: 15.00, categoria: "Hecho a mano", stock: 25, imagen: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop", descripcion: "Vela vertida artesanalmente con cera de soya orgánica.", descripcionDetallada: "Cera de soya 100% orgánica, mecha de algodón, aromas de sándalo y jazmín. Duración: 40 horas.", destacado: true, estado: "Publicado" },
                { nombre: "Organizador de Escritorio Moderno", sku: "CAR-OM-06", precio: 18.00, categoria: "Curado", stock: 18, imagen: "https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=600&auto=format&fit=crop", descripcion: "Contenedores geométricos de gran rigidez.", descripcionDetallada: "Set de 3 piezas en concreto pulido. Medidas: 10x10x10cm, 8x8x12cm, 12x12x8cm. Aptos para lápices, notas y tarjetas.", destacado: false, estado: "Publicado" }
            ];
            products = await FirebaseService.migrarProductosDemo(defaultProducts);
        }
        orders = await FirebaseService.getPedidos();
    } catch (error) {
        console.error('Error al cargar datos del admin:', error);
        products = JSON.parse(localStorage.getItem('carissma_products')) || [];
        orders = JSON.parse(localStorage.getItem('carissma_orders')) || [];
    }
}

function generateSampleOrders() {
    if (orders.length === 0) {
        orders = [
            { id: 'CRR-001', cliente: { nombre: 'María García', email: 'maria@email.com', telefono: '+58 412-1111111' }, items: [{ producto: products[0], cantidad: 2 }], subtotal: 40, envio: 0, iva: 6.4, total: 46.4, metodo_pago: 'pago_movil', estado: 'completado', fecha: '2026-06-05' },
            { id: 'CRR-002', cliente: { nombre: 'Carlos López', email: 'carlos@email.com', telefono: '+58 414-2222222' }, items: [{ producto: products[1], cantidad: 1 }, { producto: products[4], cantidad: 3 }], subtotal: 64, envio: 0, iva: 10.24, total: 74.24, metodo_pago: 'transferencia', estado: 'pendiente', fecha: '2026-06-06' },
            { id: 'CRR-003', cliente: { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '+58 416-3333333' }, items: [{ producto: products[3], cantidad: 1 }], subtotal: 25, envio: 5, iva: 4, total: 34, metodo_pago: 'zelle', estado: 'pendiente', fecha: '2026-06-07' }
        ];
        localStorage.setItem('carissma_orders', JSON.stringify(orders));
    }
}

function saveProducts() { localStorage.setItem('carissma_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('carissma_orders', JSON.stringify(orders)); }

async function reloadProducts() {
    products = await FirebaseService.getProductos();
    localStorage.setItem('carissma_products', JSON.stringify(products));
}

async function reloadOrders() {
    orders = await FirebaseService.getPedidos();
    localStorage.setItem('carissma_orders', JSON.stringify(orders));
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('ml-64');
    main.classList.toggle('ml-[70px]');
}

const sectionTitles = {
    dashboard: ['Dashboard', 'Resumen general de tu tienda'],
    productos: ['Productos', 'Gestiona tu catálogo de productos'],
    pedidos: ['Pedidos', 'Administra los pedidos de tus clientes'],
    clientes: ['Clientes', 'Base de datos de tus clientes'],
    configuracion: ['Configuración', 'Ajustes generales de la tienda'],
    'firebase-config': ['Configurar Firebase', 'Conecta tu tienda con tu base de datos en la nube'],
    'cloudinary-config': ['Configurar Cloudinary', 'Gestión de imágenes en la nube'],
    'afiliados-config': ['Configuración Afiliados', 'Personaliza textos y coletillas de productos afiliados'],
    'emailjs-config': ['Configurar EmailJS', 'Conecta el formulario de contacto de tu tienda'],
    'social-config': ['Redes Sociales', 'WhatsApp, Instagram, Facebook y más'],
    'nosotros-config': ['Sobre Nosotros', 'Edita el contenido y la imagen de la sección'],
    'seo-config': ['Analytics & SEO', 'Google Analytics, Search Console, Meta Pixel'],
    'importar-exportar': ['Importar / Exportar', 'Respalda o restaura los datos de tu tienda'],
    'contenido-config': ['Gestión de Contenido', 'Edita términos, privacidad y devoluciones'],
    'usuarios-config': ['Usuarios', 'Gestiona los usuarios administradores']
};

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`section-${section}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-zinc-400');
    });
    const navButtons = document.querySelectorAll('.nav-item');
    const sections = ['dashboard', 'productos', 'categorias-config', 'pedidos', 'clientes', 'configuracion', 'firebase-config', 'cloudinary-config', 'afiliados-config', 'emailjs-config', 'social-config', 'nosotros-config', 'seo-config', 'importar-exportar', 'contenido-config'];
    const idx = sections.indexOf(section);
    if (idx >= 0 && navButtons[idx]) {
        navButtons[idx].classList.add('active');
        navButtons[idx].classList.remove('text-zinc-400');
    }
    const [title, subtitle] = sectionTitles[section] || ['', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;
    if (section === 'dashboard') renderDashboard();
    if (section === 'clientes') renderClientsTable();
    if (section === 'firebase-config') cargarFormularioFirebase();
    if (section === 'cloudinary-config') cargarFormularioCloudinary();
    if (section === 'afiliados-config') cargarFormularioAfiliados();
    if (section === 'emailjs-config') cargarFormularioEmailJS();
    if (section === 'social-config') cargarFormularioSocial();
    if (section === 'nosotros-config') cargarFormularioNosotros();
    if (section === 'seo-config') cargarFormularioSEO();
    if (section === 'contenido-config') cargarContenidoActivo();
    if (section === 'categorias-config') cargarCategoriasPanel();
    if (section === 'usuarios-config') cargarUsuariosPanel();
    if (section === 'configuracion') cargarFormularioPagos();
}

function renderDashboard() {
    let totalSales = 0;
    let pendingOrders = 0;
    orders.forEach(o => {
        totalSales += o.total;
        if (o.estado === 'pendiente') pendingOrders++;
    });
    document.getElementById('stat-sales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-pending').textContent = `${pendingOrders} pendientes`;
    document.getElementById('stat-products').textContent = products.length;
    const uniqueClients = new Set(orders.map(o => o.cliente.email));
    document.getElementById('stat-clients').textContent = uniqueClients.size;

    const recentOrders = document.getElementById('recent-orders');
    if (orders.length === 0) {
        recentOrders.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">No hay pedidos aún</p>';
    } else {
        recentOrders.innerHTML = '';
        orders.slice(-3).reverse().forEach(order => {
            const statusColors = { completado: 'bg-green-100 text-green-700', pendiente: 'bg-yellow-100 text-yellow-700', cancelado: 'bg-red-100 text-red-700' };
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-xl';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">${order.id.slice(-2)}</div>
                    <div><p class="text-xs font-semibold text-gray-900">${order.cliente.nombre}</p><p class="text-[10px] text-gray-500">${order.fecha}</p></div>
                </div>
                <div class="text-right"><p class="text-xs font-bold text-gray-900">$${order.total.toFixed(2)}</p><span class="text-[10px] px-2 py-0.5 rounded-full ${statusColors[order.estado]}">${order.estado}</span></div>
            `;
            recentOrders.appendChild(div);
        });
    }

    const topProducts = document.getElementById('top-products');
    topProducts.innerHTML = '';
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const id = item.producto.id;
            if (!productSales[id]) productSales[id] = { product: item.producto, qty: 0, revenue: 0 };
            productSales[id].qty += item.cantidad;
            productSales[id].revenue += item.producto.precio * item.cantidad;
        });
    });
    const sorted = Object.values(productSales).sort((a, b) => b.qty - a.qty);
    if (sorted.length === 0) {
        products.slice(0, 5).forEach(p => {
            const tr = document.createElement('tr');
            tr.className = 'table-row';
            tr.innerHTML = `<td class="p-4"><div class="flex items-center gap-3"><img src="${p.imagen}" class="w-10 h-10 rounded-lg object-cover"><span class="text-sm font-medium text-gray-900">${p.nombre}</span></div></td><td class="p-4"><span class="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">${p.categoria}</span></td><td class="p-4 text-sm font-semibold text-gray-900">$${p.precio.toFixed(2)}</td><td class="p-4 text-sm text-gray-500">0</td><td class="p-4 text-sm font-semibold text-gray-900">$0.00</td>`;
            topProducts.appendChild(tr);
        });
    } else {
        sorted.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = 'table-row';
            tr.innerHTML = `<td class="p-4"><div class="flex items-center gap-3"><img src="${s.product.imagen}" class="w-10 h-10 rounded-lg object-cover"><span class="text-sm font-medium text-gray-900">${s.product.nombre}</span></div></td><td class="p-4"><span class="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">${s.product.categoria}</span></td><td class="p-4 text-sm font-semibold text-gray-900">$${s.product.precio.toFixed(2)}</td><td class="p-4 text-sm text-gray-500">${s.qty}</td><td class="p-4 text-sm font-semibold text-gray-900">$${s.revenue.toFixed(2)}</td>`;
            topProducts.appendChild(tr);
        });
    }
}

function renderSalesChart() {
    const chart = document.getElementById('sales-chart');
    if (!chart) return;
    chart.innerHTML = '';

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const ventasPorDia = [0, 0, 0, 0, 0, 0, 0];

    const pedidos = Array.isArray(orders) ? orders : [];
    pedidos.forEach(pedido => {
        if (!pedido.fecha) return;
        const fecha = new Date(pedido.fecha);
        if (isNaN(fecha.getTime())) return;
        const diaSemana = fecha.getDay();
        const idx = diaSemana === 0 ? 6 : diaSemana - 1;
        ventasPorDia[idx] += pedido.total || 0;
    });

    const maxVenta = Math.max(...ventasPorDia, 1);
    const valoresParaGrafica = ventasPorDia.map(v => Math.max(5, (v / maxVenta) * 100));

    valoresParaGrafica.forEach((val, i) => {
        const bar = document.createElement('div');
        bar.className = 'flex-1 flex flex-col items-center justify-end h-full';
        const monto = ventasPorDia[i];
        const tooltip = monto > 0 ? `$${monto.toFixed(2)} (${i + 1 === 1 ? 'Lun' : i + 1 === 2 ? 'Mar' : i + 1 === 3 ? 'Mié' : i + 1 === 4 ? 'Jue' : i + 1 === 5 ? 'Vie' : i + 1 === 6 ? 'Sáb' : 'Dom'})` : 'Sin ventas';
        bar.innerHTML = `<div class="w-full bg-orange-500 rounded-t-lg transition-all duration-500 hover:bg-orange-600 cursor-pointer" style="height: ${val}%" title="${tooltip}"></div>`;
        chart.appendChild(bar);
    });
}

function renderProductsTable() {
    const tbody = document.getElementById('products-table');
    tbody.innerHTML = '';
    const filtered = productFilter === 'todos' ? products : products.filter(p => p.categoria === productFilter);
    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'table-row';
        tr.innerHTML = `
            <td class="p-4"><div class="flex items-center gap-3"><img src="${p.imagen}" class="w-10 h-10 rounded-lg object-cover"><span class="text-sm font-medium text-gray-900">${p.nombre}</span></div></td>
            <td class="p-4"><span class="text-[10px] px-2 py-1 rounded-full ${p.categoria === 'Hecho a mano' ? 'bg-zinc-800 text-white' : 'bg-orange-100 text-orange-800'}">${p.categoria}</span></td>
            <td class="p-4 text-sm font-semibold text-gray-900">$${p.precio.toFixed(2)}</td>
            <td class="p-4"><span class="w-2 h-2 bg-green-500 rounded-full inline-block"></span><span class="text-xs text-gray-600 ml-2">Activo</span></td>
            <td class="p-4 text-right">
                <button onclick="editProduct('${p.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-3 cursor-pointer">Editar</button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterProducts(cat) {
    productFilter = cat;
    ['todos', 'handmade', 'curated'].forEach(key => {
        const btn = document.getElementById(`fp-${key.toLowerCase()}`);
        if (btn) {
            btn.className = 'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ';
            if ((key === 'todos' && cat === 'todos') || (key === 'handmade' && cat === 'Hecho a mano') || (key === 'curated' && cat === 'Curado')) {
                btn.className += 'bg-orange-600 text-white';
            } else {
                btn.className += 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';
            }
        }
    });
    renderProductsTable();
}

function openProductModal() {
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Agregar Producto';
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function editProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal-title').textContent = 'Editar Producto';
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.nombre;
    document.getElementById('product-price').value = p.precio;
    document.getElementById('product-category').value = p.categoria;
    document.getElementById('product-image').value = p.imagen;
    document.getElementById('product-desc').value = p.descripcion;
    document.getElementById('product-es-afiliado').checked = p.esAfiliado || false;
    document.getElementById('product-tienda').value = p.tienda || '';
    document.getElementById('product-url-afiliado').value = p.urlAfiliado || '';
    toggleAfiliadoFields();
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await FirebaseService.deleteProducto(id);
        await reloadProducts();
        renderProductsTable();
        renderDashboard();
    } catch (error) {
        alert('Error al eliminar producto');
    }
}

document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const esAfiliado = document.getElementById('product-es-afiliado').checked;
    const data = {
        nombre: document.getElementById('product-name').value,
        precio: parseFloat(document.getElementById('product-price').value),
        categoria: document.getElementById('product-category').value,
        imagen: document.getElementById('product-image').value,
        descripcion: document.getElementById('product-desc').value,
        esAfiliado: esAfiliado,
        tienda: esAfiliado ? (document.getElementById('product-tienda').value || '') : '',
        urlAfiliado: esAfiliado ? (document.getElementById('product-url-afiliado').value.trim() || '') : ''
    };
    try {
        if (id) {
            await FirebaseService.updateProducto(id, data);
        } else {
            await FirebaseService.addProducto(data);
        }
        await reloadProducts();
        renderProductsTable();
        renderDashboard();
        closeProductModal();
    } catch (error) {
        alert('Error al guardar producto: ' + error.message);
    }
});

function renderOrdersTable() {
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = '';
    const filtered = orderFilter === 'todos' ? orders : orders.filter(o => o.estado === orderFilter);
    const paymentLabels = { pago_movil: 'Pago Móvil', transferencia: 'Transferencia', zelle: 'Zelle', paypal: 'PayPal', efectivo: 'Efectivo' };
    const statusColors = { completado: 'bg-green-100 text-green-700', pendiente: 'bg-yellow-100 text-yellow-700', cancelado: 'bg-red-100 text-red-700' };
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-400 text-sm">No hay pedidos para mostrar</td></tr>';
        return;
    }
    filtered.forEach(order => {
        const itemCount = order.items.reduce((sum, i) => sum + i.cantidad, 0);
        const tr = document.createElement('tr');
        tr.className = 'table-row';
        tr.innerHTML = `
            <td class="p-4 text-sm font-semibold text-gray-900">${order.id}</td>
            <td class="p-4 text-sm text-gray-700">${order.cliente.nombre}</td>
            <td class="p-4 text-sm text-gray-500">${itemCount} artículo(s)</td>
            <td class="p-4 text-sm font-bold text-gray-900">$${order.total.toFixed(2)}</td>
            <td class="p-4 text-xs text-gray-600">${paymentLabels[order.metodo_pago] || order.metodo_pago}</td>
            <td class="p-4"><span class="text-[10px] px-2.5 py-1 rounded-full font-semibold ${statusColors[order.estado]}">${order.estado}</span></td>
            <td class="p-4 text-right">
                <button onclick="viewOrder('${order.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-2 cursor-pointer">Ver</button>
                <button onclick="changeOrderStatus('${order.id}')" class="text-orange-600 hover:text-orange-800 text-xs font-semibold cursor-pointer">Cambiar Estado</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOrders(status) {
    orderFilter = status;
    ['todos', 'pendiente', 'completado', 'cancelado'].forEach(key => {
        const btn = document.getElementById(`fo-${key}`);
        if (btn) {
            btn.className = 'px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ';
            if (key === status) {
                btn.className += 'bg-orange-600 text-white';
            } else {
                btn.className += 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';
            }
        }
    });
    renderOrdersTable();
}

function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const paymentLabels = { pago_movil: 'Pago Móvil', transferencia: 'Transferencia Bancaria', zelle: 'Zelle', paypal: 'PayPal', efectivo: 'Efectivo' };
    const content = document.getElementById('order-detail-content');
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `
            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <img src="${item.producto.imagen}" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1"><p class="text-xs font-semibold text-gray-900">${item.producto.nombre}</p><p class="text-[10px] text-gray-500">x${item.cantidad}</p></div>
                <span class="text-sm font-bold text-gray-900">$${(item.producto.precio * item.cantidad).toFixed(2)}</span>
            </div>
        `;
    });
    content.innerHTML = `
        <div class="space-y-4">
            <div class="bg-gray-50 rounded-xl p-4"><p class="text-[10px] font-bold text-gray-400 uppercase">Pedido</p><p class="text-sm font-bold text-gray-900">${order.id}</p><p class="text-[10px] text-gray-500 mt-1">${order.fecha}</p></div>
            <div class="bg-gray-50 rounded-xl p-4"><p class="text-[10px] font-bold text-gray-400 uppercase">Cliente</p><p class="text-sm font-semibold text-gray-900">${order.cliente.nombre}</p><p class="text-xs text-gray-600">${order.cliente.email}</p><p class="text-xs text-gray-600">${order.cliente.telefono}</p></div>
            <div><p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Productos</p><div class="space-y-2">${itemsHtml}</div></div>
            <div class="border-t border-gray-200 pt-3 space-y-1">
                <div class="flex justify-between text-xs"><span class="text-gray-600">Subtotal</span><span class="font-semibold">$${order.subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between text-xs"><span class="text-gray-600">Envío</span><span class="font-semibold">${order.envio === 0 ? 'Gratis' : '$' + order.envio.toFixed(2)}</span></div>
                <div class="flex justify-between text-xs"><span class="text-gray-600">IVA</span><span class="font-semibold">$${order.iva.toFixed(2)}</span></div>
                <div class="flex justify-between text-sm font-bold border-t border-gray-200 pt-2"><span>Total</span><span class="text-orange-600">$${order.total.toFixed(2)}</span></div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4"><p class="text-[10px] font-bold text-gray-400 uppercase">Método de Pago</p><p class="text-sm font-semibold text-gray-900">${paymentLabels[order.metodo_pago] || order.metodo_pago}</p></div>
        </div>
    `;
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

async function changeOrderStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const states = ['pendiente', 'completado', 'cancelado'];
    const currentIdx = states.indexOf(order.estado);
    const nextIdx = (currentIdx + 1) % states.length;
    const newState = states[nextIdx];
    try {
        await FirebaseService.updatePedido(id, { estado: newState });
        await reloadOrders();
        renderOrdersTable();
        renderDashboard();
    } catch (error) {
        alert('Error al cambiar estado del pedido');
    }
}

function renderClientsTable() {
    const tbody = document.getElementById('clients-table');
    tbody.innerHTML = '';
    const clientMap = {};
    orders.forEach(order => {
        const email = order.cliente.email;
        if (!clientMap[email]) {
            clientMap[email] = { nombre: order.cliente.nombre, email: email, telefono: order.cliente.telefono, pedidos: 0, total: 0 };
        }
        clientMap[email].pedidos++;
        clientMap[email].total += order.total;
    });
    const clients = Object.values(clientMap);
    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-400 text-sm">Aún no hay clientes registrados</td></tr>';
        return;
    }
    clients.forEach(c => {
        const tr = document.createElement('tr');
        tr.className = 'table-row';
        tr.innerHTML = `
            <td class="p-4"><div class="flex items-center gap-3"><div class="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">${c.nombre.charAt(0)}</div><span class="text-sm font-medium text-gray-900">${c.nombre}</span></div></td>
            <td class="p-4 text-sm text-gray-600">${c.email}</td>
            <td class="p-4 text-sm text-gray-600">${c.telefono}</td>
            <td class="p-4 text-sm font-semibold text-gray-900">${c.pedidos}</td>
            <td class="p-4 text-sm font-bold text-gray-900">$${c.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}
