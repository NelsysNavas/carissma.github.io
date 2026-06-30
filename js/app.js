/* ============================================
   CARISSMA - app.js
   Lógica principal del Front-End
   ============================================ */

const defaultProducts = [
    { id: "p1", nombre: "Aretes de Mostacilla Tejidos", precio: 20.00, categoria: "Hecho a mano", descripcion: "Elegantes aretes confeccionados a mano por artesanos locales con un patrón geométrico único y colores de temporada.", imagen: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop" },
    { id: "p2", nombre: "Taza de Cerámica Rústica", precio: 19.00, categoria: "Hecho a mano", descripcion: "Hecha en torno de alfarero y esmaltada a mano con un degradado en tonos arena y mar que hace que cada taza sea única.", imagen: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop" },
    { id: "p3", nombre: "Set de Papelería Minimalista", precio: 19.00, categoria: "Curado", descripcion: "Un set de escritura minimalista seleccionado cuidadosamente de marcas premium que incluye carpetas, libreta e instrumental de dibujo.", imagen: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop" },
    { id: "p4", nombre: "Diario de Cuero Envejecido", precio: 25.00, categoria: "Hecho a mano", descripcion: "Libreta encuadernada artesanalmente con piel genuina y papel de algodón reciclado, ideal para bocetos y notas personales.", imagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop" },
    { id: "p5", nombre: "Vela de Soya Aromática", precio: 15.00, categoria: "Hecho a mano", descripcion: "Vela vertida artesanalmente a mano con cera de soya orgánica, mecha de algodón y esencias relajantes de sándalo y jazmín.", imagen: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop" },
    { id: "p6", nombre: "Organizador de Escritorio Moderno", precio: 18.00, categoria: "Curado", descripcion: "Diseñado para mantener la pulcritud espacial. Contenedores geométricos de gran rigidez aptos para lápices, notas y tarjetas.", imagen: "https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=600&auto=format&fit=crop" }
];

let mockProducts = [];

async function cargarProductos() {
    try {
        const productosFirebase = await FirebaseService.getProductos();
        if (productosFirebase.length === 0) {
            console.log('Firebase vacío. Migrando productos demo...');
            mockProducts = await FirebaseService.migrarProductosDemo(defaultProducts);
        } else {
            mockProducts = productosFirebase;
        }
        localStorage.setItem('carissma_products', JSON.stringify(mockProducts));
        renderProducts();
        updateCartUI();
    } catch (error) {
        console.error('Error al cargar productos, usando demo local:', error);
        mockProducts = defaultProducts;
        renderProducts();
    }
}

let cart = [];
let activeCategory = 'todos';
let modalQty = 1;
let selectedPayment = null;
let currentStep = 1;

window.addEventListener('storage', function(e) {
    if (e.key === 'carissma_products' && e.newValue) {
        mockProducts = JSON.parse(e.newValue);
        renderProducts();
    }
});

window.onload = function() {
    cargarProductos();
    actualizarBotonesSociales();
    cargarSeccionNosotros();
    actualizarOpcionesPago();
    actualizarColetillaAfiliados();
    actualizarCamposFactura();
    actualizarUbicacionPais();
    inyectarScriptsSEO();
};

function inyectarScriptsSEO() {
    const config = getSEOConfig();

    if (config.searchConsole.activo && config.searchConsole.content) {
        let meta = document.querySelector('meta[name="google-site-verification"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'google-site-verification');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', config.searchConsole.content);
    }

    if (config.googleAnalytics.activo) {
        if (config.googleAnalytics.codigoCompleto) {
            const temp = document.createElement('div');
            temp.innerHTML = config.googleAnalytics.codigoCompleto;
            const scripts = temp.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = script.textContent;
                document.head.appendChild(newScript);
            });
        } else if (config.googleAnalytics.id) {
            const gaId = config.googleAnalytics.id;
            if (!document.querySelector(`script[src*="googletagmanager"][src*="${gaId}"]`)) {
                const script1 = document.createElement('script');
                script1.async = true;
                script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                document.head.appendChild(script1);

                const script2 = document.createElement('script');
                script2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
                document.head.appendChild(script2);
            }
        }
    }

    if (config.metaPixel.activo && config.metaPixel.pixelId) {
        const pixelId = config.metaPixel.pixelId;
        if (!window.fbq) {
            const script1 = document.createElement('script');
            script1.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${pixelId}');fbq('track', 'PageView');`;
            document.head.appendChild(script1);

            const noscript = document.createElement('noscript');
            const img = document.createElement('img');
            img.height = '1';
            img.width = '1';
            img.style.display = 'none';
            img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
            noscript.appendChild(img);
            document.body.appendChild(noscript);
        }
    }
}

async function cargarSeccionNosotros() {
    try {
        const doc = await db.collection('configuracion').doc('nosotros').get();
        if (doc.exists) {
            const data = doc.data();
            const img = document.getElementById('nosotros-imagen-front');
            if (img && data.imagen) img.src = data.imagen;
            const etiqueta = document.getElementById('nosotros-etiqueta-front');
            if (etiqueta && data.etiqueta) etiqueta.textContent = data.etiqueta;
            const titulo = document.getElementById('nosotros-titulo-front');
            if (titulo && data.titulo) titulo.textContent = data.titulo;
            const parrafo = document.getElementById('nosotros-parrafo-front');
            if (parrafo && data.parrafo) parrafo.innerHTML = data.parrafo;
        }
    } catch (error) {
        console.log('Usando valores por defecto para Sobre Nosotros');
    }
}

function actualizarOpcionesPago() {
    const config = getPagosConfig();
    const metodosActivos = getMetodosPagoActivos();

    const paymentOptions = document.querySelectorAll('.payment-option');
    const metodosKeys = ['pago_movil', 'transferencia', 'zelle', 'paypal', 'efectivo'];
    const metodosLabels = {
        pago_movil: 'Pago Móvil',
        transferencia: 'Transferencia Bancaria',
        zelle: 'Zelle',
        paypal: 'PayPal',
        efectivo: 'Efectivo / Pago en Persona'
    };

    paymentOptions.forEach((option, index) => {
        if (index < metodosKeys.length) {
            const key = metodosKeys[index];
            if (metodosActivos.includes(key)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        }
    });

    const detallesPM = document.getElementById('pago-movil-details');
    const detallesTF = document.getElementById('transferencia-details');
    const detallesZelle = document.getElementById('zelle-details');
    const detallesPaypal = document.getElementById('paypal-details');
    const detallesEfectivo = document.getElementById('efectivo-details');

    if (detallesPM && config.pago_movil) {
        const pmBox = detallesPM.querySelector('.bg-green-50');
        if (pmBox) {
            pmBox.innerHTML = `
                <p class="text-[10px] font-bold text-green-800 uppercase">Datos para Pago Móvil</p>
                <p class="text-xs text-green-700 mt-1"><strong>Banco:</strong> ${config.pago_movil.banco}</p>
                <p class="text-xs text-green-700"><strong>Cédula:</strong> ${config.pago_movil.cedula}</p>
                <p class="text-xs text-green-700"><strong>Teléfono:</strong> ${config.pago_movil.telefono}</p>
                <p class="text-xs text-green-700"><strong>Beneficiario:</strong> ${config.pago_movil.beneficiario}</p>
            `;
        }
    }
    if (detallesTF && config.transferencia) {
        const tfBox = detallesTF.querySelector('.bg-blue-50');
        if (tfBox) {
            tfBox.innerHTML = `
                <p class="text-[10px] font-bold text-blue-800 uppercase">Datos Bancarios</p>
                <p class="text-xs text-blue-700 mt-1"><strong>Banco:</strong> ${config.transferencia.banco}</p>
                <p class="text-xs text-blue-700"><strong>Cuenta:</strong> ${config.transferencia.cuenta}</p>
                <p class="text-xs text-blue-700"><strong>Titular:</strong> ${config.transferencia.titular}</p>
                <p class="text-xs text-blue-700"><strong>Cédula:</strong> ${config.transferencia.cedula}</p>
            `;
        }
    }
    if (detallesZelle && config.zelle) {
        const zBox = detallesZelle.querySelector('.bg-purple-50');
        if (zBox) {
            zBox.innerHTML = `
                <p class="text-[10px] font-bold text-purple-800 uppercase">Datos para Zelle</p>
                <p class="text-xs text-purple-700 mt-1"><strong>Email:</strong> ${config.zelle.email}</p>
                <p class="text-xs text-purple-700"><strong>Nombre:</strong> ${config.zelle.nombre}</p>
            `;
        }
    }
    if (detallesPaypal && config.paypal) {
        const pBox = detallesPaypal.querySelector('.bg-yellow-50');
        if (pBox) {
            pBox.innerHTML = `
                <p class="text-[10px] font-bold text-yellow-800 uppercase">Pago con PayPal</p>
                <p class="text-xs text-yellow-700 mt-1">Serás redirigido a PayPal para completar el pago de forma segura.</p>
                <p class="text-xs text-yellow-700 mt-1"><strong>Cuenta:</strong> ${config.paypal.email}</p>
            `;
        }
    }
    if (detallesEfectivo && config.efectivo) {
        const eBox = detallesEfectivo.querySelector('.bg-orange-50');
        if (eBox) {
            eBox.innerHTML = `
                <p class="text-[10px] font-bold text-orange-800 uppercase">Pago en Efectivo</p>
                <p class="text-xs text-orange-700 mt-1">${config.efectivo.mensaje}</p>
            `;
        }
    }
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = activeCategory === 'todos'
        ? mockProducts
        : mockProducts.filter(p => p.categoria.toLowerCase() === activeCategory.toLowerCase());

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl shadow-xs hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition duration-300 transform hover:-translate-y-1";

        const isHandmade = product.categoria.toLowerCase() === 'hecho a mano';
        const tagColorClass = isHandmade
            ? "bg-zinc-800 text-white"
            : "bg-orange-100 text-orange-800 border border-orange-200";

        card.innerHTML = `
            <div class="relative h-40 sm:h-48 md:h-64 bg-gray-100 overflow-hidden rounded-t-2xl group cursor-pointer" onclick="showProductDetails('${product.id}')">
                <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
                <span class="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-xs ${tagColorClass}">
                    ${product.categoria}
                </span>
            </div>
            <div class="p-3 sm:p-5 flex flex-col flex-grow">
                <h4 class="font-semibold text-gray-900 text-sm sm:text-base md:text-lg mb-1 hover:text-orange-600 transition cursor-pointer line-clamp-1 sm:line-clamp-2" onclick="showProductDetails('${product.id}')">
                    ${product.nombre}
                </h4>
                <p class="text-gray-500 text-[10px] sm:text-xs flex-grow mb-3 sm:mb-4 line-clamp-2">${product.descripcion}</p>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-auto">
                    <span class="text-base sm:text-lg md:text-xl font-bold text-gray-900">$${product.precio.toFixed(2)}${product.esAfiliado ? '<sup class="text-orange-600 text-xs ml-0.5">*</sup>' : ''}</span>
                    <button onclick="addToCart('${product.id}')" class="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1">
                        <span>Añadir</span>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    const hasAfiliados = filtered.some(p => p.esAfiliado);
    const container = document.getElementById('aff-coletilla-container');
    if (container) {
        if (hasAfiliados) {
            container.classList.remove('hidden');
            cargarColetillaPublica();
        } else {
            container.classList.add('hidden');
        }
    }
}

function filterCategory(category) {
    activeCategory = category;

    const titleEl = document.getElementById('category-title');
    const descEl = document.getElementById('category-desc');

    if (category === 'todos') {
        if (titleEl) titleEl.textContent = "Nuestra Colección";
        if (descEl) descEl.textContent = "Explora piezas artesanales hechas a mano y artículos de diseño curados.";
    } else if (category === 'Hecho a mano') {
        if (titleEl) titleEl.textContent = "Hecho a Mano";
        if (descEl) descEl.textContent = "Artesanía local auténtica fabricada de manera tradicional y con amor.";
    } else {
        if (titleEl) titleEl.textContent = "Curado por Expertos";
        if (descEl) descEl.textContent = "Selección estricta de productos modernos elegidos por su diseño y calidad.";
    }

    const btns = ['todos', 'handmade', 'curated'];
    const labels = { 'todos': 'todos', 'handmade': 'Hecho a mano', 'curated': 'Curado' };

    btns.forEach(b => {
        const navBtn = document.getElementById(`btn-nav-${b}`);
        const filterBtn = document.getElementById(`btn-filter-${b}`);
        const isSelected = labels[b].toLowerCase() === category.toLowerCase() || (b === 'todos' && category === 'todos');

        if (navBtn) {
            navBtn.className = isSelected
                ? "hover:text-orange-600 transition border-b-2 border-orange-500 pb-1 text-orange-600 cursor-pointer inline-block"
                : "hover:text-orange-600 transition border-b-2 border-transparent pb-1 cursor-pointer inline-block";
        }
        if (filterBtn) {
            filterBtn.className = isSelected
                ? "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold bg-orange-600 text-white shadow-xs transition hover:bg-orange-700 cursor-pointer"
                : "flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer";
        }
    });

    renderProducts();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar) return;

    const isOpen = !sidebar.classList.contains('translate-x-full');

    if (isOpen) {
        sidebar.classList.add('translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.remove('translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    if (!sidebar) return;

    const isOpen = !sidebar.classList.contains('-translate-x-full');

    if (isOpen) {
        sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.remove('-translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function addToCart(productId) {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.product.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    updateCartUI();
    bumpCartCounter();
}

function addToCartWithQty(productId, qty) {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.product.id === productId);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ product, quantity: qty });
    }

    updateCartUI();
    bumpCartCounter();
}

function updateQuantity(productId, amount) {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.product.id !== productId);
    }

    updateCartUI();
}

function bumpCartCounter() {
    const el = document.getElementById('cart-counter');
    if (!el) return;
    el.classList.add('scale-125', 'bg-emerald-600');
    setTimeout(() => el.classList.remove('scale-125', 'bg-emerald-600'), 300);
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const totalCountElement = document.getElementById('cart-counter');
    const subtotalElement = document.getElementById('cart-subtotal');

    if (typeof actualizarColetillaAfiliados === 'function') {
        actualizarColetillaAfiliados();
    }

    let totalQty = 0;
    let subtotal = 0;

    if (cart.length === 0) {
        if (itemsContainer) {
            itemsContainer.innerHTML = `
                <div class="text-center py-12 text-gray-400 flex flex-col items-center justify-center h-full">
                    <img src="images/shopping-bag.svg" alt="Carrito vacío" class="w-20 h-20 mb-3 opacity-60">
                    <p class="font-medium text-gray-600">Tu carrito está vacío</p>
                    <p class="text-xs text-gray-400 mt-1">¡Suma tus piezas favoritas!</p>
                </div>
            `;
        }
    } else {
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            cart.forEach(item => {
                totalQty += item.quantity;
                subtotal += item.product.precio * item.quantity;

                const itemRow = document.createElement('div');
                itemRow.className = "flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100";
                itemRow.innerHTML = `
                    <img src="${item.product.imagen}" alt="${item.product.nombre}" class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                        <h5 class="text-xs font-semibold text-gray-800 line-clamp-1">${item.product.nombre}</h5>
                        <p class="text-[10px] text-gray-400 font-medium">${item.product.categoria}</p>
                        <p class="text-sm font-bold text-gray-900 mt-1">$${item.product.precio.toFixed(2)}</p>
                    </div>
                    <div class="qty-selector">
                        <button onclick="updateQuantity('${item.product.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.product.id}', 1)">+</button>
                    </div>
                `;
                itemsContainer.appendChild(itemRow);
            });
        }
    }

    if (totalCountElement) totalCountElement.textContent = totalQty;
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
}

function decrementModalQty() {
    if (modalQty > 1) {
        modalQty--;
        const el = document.getElementById('modal-qty-val');
        if (el) el.textContent = modalQty;
    }
}

function incrementModalQty() {
    modalQty++;
    const el = document.getElementById('modal-qty-val');
    if (el) el.textContent = modalQty;
}

function showProductDetails(productId) {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    modalQty = 1;

    const modal = document.getElementById('detail-modal');
    const modalContainer = document.getElementById('modal-card-inner');
    if (!modal || !modalContainer) return;

    modalContainer.classList.remove('max-w-lg');
    modalContainer.classList.add('max-w-3xl');

    const header = document.getElementById('modal-header');
    if (header) header.classList.add('hidden');

    const content = document.getElementById('modal-content-area');
    const isHandmade = product.categoria.toLowerCase() === 'hecho a mano';
    const tagColorClass = isHandmade ? 'bg-zinc-800 text-white' : 'bg-orange-100 text-orange-800 border border-orange-200';
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative pt-4">
            <button onclick="closeDetailModal()" class="absolute -top-4 -right-2 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer z-20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div class="rounded-2xl overflow-hidden h-72 md:h-[400px] bg-gray-50 shadow-inner group relative">
                <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition duration-700 group-hover:scale-103">
                <div class="absolute inset-0 bg-orange-950/5 mix-blend-multiply"></div>
            </div>
            <div class="flex flex-col h-full space-y-4 justify-between">
                <div class="space-y-4">
                    <div>
                        <span class="${tagColorClass} font-bold uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-md inline-block">
                            ${product.categoria}
                        </span>
                        <h3 class="serif-font text-2xl md:text-3xl font-bold text-gray-950 mt-3 leading-tight">${product.nombre}</h3>
                    </div>
                    <p class="text-gray-500 text-sm leading-relaxed">${product.descripcion}</p>
                    <div class="flex items-center gap-4 pt-2">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cantidad:</span>
                        <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 shadow-xs">
                            <button onclick="decrementModalQty()" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 font-bold transition focus:outline-none cursor-pointer">-</button>
                            <span id="modal-qty-val" class="w-8 text-center text-sm font-semibold text-gray-800">1</span>
                            <button onclick="incrementModalQty()" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 font-bold transition focus:outline-none cursor-pointer">+</button>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-100 mt-6">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio Total</span>
                        <span class="text-3xl font-black text-gray-950">$${product.precio.toFixed(2)}</span>
                    </div>
                    <button onclick="addToCartWithQty('${product.id}', modalQty); closeDetailModal();" class="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                        <img src="images/shopping-bag.svg" alt="" class="w-4 h-4 invert brightness-0">
                        <span>Añadir al Pedido</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('modal-open');
}

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    modal.classList.remove('modal-open');

    const modalContainer = document.getElementById('modal-card-inner');
    if (modalContainer) {
        modalContainer.classList.remove('max-w-3xl');
        modalContainer.classList.add('max-w-lg');
    }

    const header = document.getElementById('modal-header');
    if (header) header.classList.remove('hidden');
}

function showSectionModal(titleText, bodyText) {
    const modal = document.getElementById('detail-modal');
    const modalContainer = document.getElementById('modal-card-inner');
    if (!modal || !modalContainer) return;

    modalContainer.classList.remove('max-w-3xl');
    modalContainer.classList.add('max-w-lg');

    const header = document.getElementById('modal-header');
    if (header) header.classList.remove('hidden');

    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content-area');

    if (title) title.textContent = titleText;
    if (content) {
        content.innerHTML = `
            <div class="space-y-4 py-2">
                <p class="text-gray-600 text-sm leading-relaxed">${bodyText}</p>
                <div class="flex justify-end pt-4 border-t border-gray-100">
                    <button onclick="closeDetailModal()" class="btn btn-primary">Entendido</button>
                </div>
            </div>
        `;
    }

    modal.classList.add('modal-open');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showSectionModal('Carrito Vacío', 'Por favor, añade al menos un producto a tu carrito de compras antes de continuar.');
        return;
    }
    toggleCart();
    setTimeout(() => openCheckoutModal(), 350);
}

function openCheckoutModal() {
    currentStep = 1;
    selectedPayment = null;
    updateStepUI();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
    if (currentStep === 4) {
        cart = [];
        updateCartUI();
    }
}

function goToStep(step) {
    if (step === 2 && currentStep === 1) {
        const name = document.getElementById('ship-name')?.value.trim();
        const lastname = document.getElementById('ship-lastname')?.value.trim();
        const phone = document.getElementById('ship-phone')?.value.trim();
        const email = document.getElementById('ship-email')?.value.trim();
        const address = document.getElementById('ship-address')?.value.trim();
        const city = document.getElementById('ship-city')?.value.trim();
        const state = document.getElementById('ship-state')?.value;
        if (!name || !lastname || !phone || !email || !address || !city || !state) {
            showSectionModal('Campos Incompletos', 'Por favor, completa todos los campos obligatorios de envío antes de continuar.');
            return;
        }
    }
    if (step === 3 && currentStep === 2) {
        if (!selectedPayment) {
            showSectionModal('Selecciona un Método', 'Por favor, selecciona un método de pago para continuar.');
            return;
        }
        if (selectedPayment === 'pago_movil') {
            const ref = document.getElementById('pm-reference')?.value.trim();
            const last4 = document.getElementById('pm-last4')?.value.trim();
            if (!ref || !last4) {
                showSectionModal('Campos Incompletos', 'Por favor, ingresa el número de referencia y los últimos 4 dígitos de la cuenta.');
                return;
            }
        }
        if (selectedPayment === 'transferencia') {
            const ref = document.getElementById('tf-reference')?.value.trim();
            if (!ref) {
                showSectionModal('Campo Requerido', 'Por favor, ingresa el número de referencia de la transferencia.');
                return;
            }
        }
        if (selectedPayment === 'zelle') {
            const email = document.getElementById('zelle-email')?.value.trim();
            if (!email) {
                showSectionModal('Campo Requerido', 'Por favor, ingresa tu correo de Zelle.');
                return;
            }
        }
        buildOrderSummary();
    }
    currentStep = step;
    updateStepUI();
}

function updateStepUI() {
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`checkout-step-${i}`);
        const indicator = document.getElementById(`step-${i}-indicator`);
        const label = document.getElementById(`step-${i}-label`);

        if (stepEl) {
            stepEl.classList.remove('active');
            if (i === currentStep) stepEl.classList.add('active');
        }
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i === currentStep) indicator.classList.add('active');
            if (i < currentStep) indicator.classList.add('completed');
            indicator.innerHTML = i < currentStep
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>'
                : i;
        }
        if (label) {
            label.classList.remove('text-orange-600', 'text-gray-400', 'text-green-600');
            if (i === currentStep) label.classList.add('text-orange-600');
            else if (i < currentStep) label.classList.add('text-green-600');
            else label.classList.add('text-gray-400');
        }
    }
    const line1 = document.getElementById('step-1-line');
    const line2 = document.getElementById('step-2-line');
    if (line1) line1.style.width = currentStep >= 2 ? '100%' : '0%';
    if (line2) line2.style.width = currentStep >= 3 ? '100%' : '0%';
}

function selectPayment(method) {
    selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(el => {
        el.classList.remove('selected');
        const radio = el.querySelector('input[type=radio]');
        if (radio) radio.checked = false;
        const radioDiv = el.querySelector('[id^=radio-]');
        if (radioDiv) {
            const dot = radioDiv.querySelector('div');
            if (dot) dot.classList.add('hidden');
        }
        const details = el.querySelector('[id$=-details]');
        if (details) details.classList.add('hidden');
    });
    const selected = document.querySelector(`[value="${method}"]`)?.closest('.payment-option');
    if (selected) {
        selected.classList.add('selected');
        const radio = selected.querySelector('input[type=radio]');
        if (radio) radio.checked = true;
        const dot = selected.querySelector('[id^=radio-] div');
        if (dot) dot.classList.remove('hidden');
        const details = selected.querySelector('[id$=-details]');
        if (details) details.classList.remove('hidden');
    }
}

function buildOrderSummary() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    container.innerHTML = '';
    let itemCount = 0;
    cart.forEach(item => {
        itemCount += item.quantity;
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 bg-gray-50 p-3 rounded-xl';
        row.innerHTML = `
            <img src="${item.product.imagen}" alt="${item.product.nombre}" class="w-12 h-12 object-cover rounded-lg">
            <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-900 truncate">${item.product.nombre}</p>
                <p class="text-[10px] text-gray-500">x${item.quantity}</p>
            </div>
            <span class="text-sm font-bold text-gray-900">$${(item.product.precio * item.quantity).toFixed(2)}</span>
        `;
        container.appendChild(row);
    });
    let subtotal = 0;
    cart.forEach(item => { subtotal += item.product.precio * item.quantity; });
    const shipping = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.16;
    const total = subtotal + shipping + tax;

    const nameEl = document.getElementById('ship-name');
    const lastnameEl = document.getElementById('ship-lastname');
    const addressEl = document.getElementById('ship-address');
    const cityEl = document.getElementById('ship-city');
    const stateEl = document.getElementById('ship-state');

    const summaryName = document.getElementById('summary-name');
    const summaryAddress = document.getElementById('summary-address');
    if (summaryName) summaryName.textContent = `${nameEl?.value || ''} ${lastnameEl?.value || ''}`;
    if (summaryAddress) summaryAddress.textContent = `${addressEl?.value || ''}, ${cityEl?.value || ''}, ${stateEl?.value || ''}`;

    const paymentLabels = {
        'pago_movil': 'Pago Móvil',
        'transferencia': 'Transferencia Bancaria',
        'zelle': 'Zelle',
        'paypal': 'PayPal',
        'efectivo': 'Efectivo en Persona'
    };
    const summaryPayment = document.getElementById('summary-payment');
    if (summaryPayment) summaryPayment.textContent = paymentLabels[selectedPayment] || selectedPayment;

    const summaryCount = document.getElementById('summary-count');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTax = document.getElementById('summary-tax');
    const summaryTotal = document.getElementById('summary-total');

    if (summaryCount) summaryCount.textContent = itemCount;
    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryShipping) summaryShipping.textContent = shipping === 0 ? '¡Gratis!' : `$${shipping.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function actualizarCamposFactura() {
    const facturaSeleccionada = document.querySelector('input[name="factura"]:checked')?.value;
    const campoRif = document.getElementById('campo-rif');
    const campoRecibo = document.getElementById('campo-recibo');

    if (campoRif) campoRif.classList.add('hidden');
    if (campoRecibo) campoRecibo.classList.add('hidden');

    if (facturaSeleccionada === 'fiscal' && campoRif) {
        campoRif.classList.remove('hidden');
    } else if (facturaSeleccionada === 'simple' && campoRecibo) {
        campoRecibo.classList.remove('hidden');
    }
}

function actualizarUbicacionPais() {
    const ubicacion = document.querySelector('input[name="ubicacion"]:checked')?.value;
    const nota = document.getElementById('ubicacion-nota');
    if (nota) {
        if (ubicacion === 'extranjero') {
            nota.classList.remove('hidden');
        } else {
            nota.classList.add('hidden');
        }
    }
}

function actualizarColetillaAfiliados() {
    const tieneAfiliados = cart.some(item => item.product.esAfiliado);
    const div = document.getElementById('afiliados-coletilla');
    if (div) {
        if (tieneAfiliados) {
            div.classList.remove('hidden');
        } else {
            div.classList.add('hidden');
        }
    }
}

function confirmOrder() {
    const orderId = 'CRR-' + Date.now().toString(36).toUpperCase();
    const orderNumberEl = document.getElementById('order-number');
    if (orderNumberEl) orderNumberEl.textContent = orderId;

    const productosLocales = cart.filter(item => !item.product.esAfiliado);
    const productosAfiliados = cart.filter(item => item.product.esAfiliado);

    const facturaTipo = document.querySelector('input[name="factura"]:checked')?.value || 'ninguna';
    const ubicacionPais = document.querySelector('input[name="ubicacion"]:checked')?.value || 'venezuela';
    const facturaRif = document.getElementById('factura-rif')?.value.trim() || '';
    const facturaEmail = document.getElementById('factura-email')?.value.trim() || '';

    if (facturaTipo === 'fiscal' && !facturaRif) {
        showSectionModal('RIF Requerido', 'Para emitir tu factura fiscal necesitamos tu RIF o cédula. Por favor complétalo.');
        return;
    }
    if (facturaTipo === 'simple' && !facturaEmail) {
        showSectionModal('Email Requerido', 'Para enviarte el recibo simple necesitamos tu email. Por favor complétalo.');
        return;
    }

    let orderDetails = `*Pedido ${orderId}*\n\n`;
    let subtotal = 0;
    const items = [];

    if (productosLocales.length > 0) {
        orderDetails += `*Productos Carissma:*\n`;
        productosLocales.forEach(item => {
            orderDetails += `- ${item.product.nombre} (x${item.quantity}): $${(item.product.precio * item.quantity).toFixed(2)}\n`;
            subtotal += item.product.precio * item.quantity;
            items.push({ producto: item.product, cantidad: item.quantity });
        });
    }

    if (productosAfiliados.length > 0) {
        orderDetails += `\n*Productos de tienda externa:*\n`;
        orderDetails += `_(Facturados directamente por la tienda)_\n`;
        productosAfiliados.forEach(item => {
            orderDetails += `- ${item.product.nombre} (x${item.quantity}) - Ref: ${item.product.urlAfiliado || 'Pendiente'}\n`;
            items.push({ producto: item.product, cantidad: item.quantity });
        });
    }

    const shipping = subtotal >= 50 ? 0 : 5;
    const tax = subtotal * 0.16;
    const total = subtotal + shipping + tax;
    orderDetails += `\n*Subtotal:* $${subtotal.toFixed(2)}`;
    orderDetails += `\n*Envío:* ${shipping === 0 ? 'Gratis' : '$' + shipping.toFixed(2)}`;
    orderDetails += `\n*IVA:* $${tax.toFixed(2)}`;
    orderDetails += `\n*Total:* $${total.toFixed(2)}`;
    orderDetails += `\n\n*Método de Pago:* ${document.getElementById('summary-payment')?.textContent || ''}`;
    orderDetails += `\n*Envío a:* ${document.getElementById('summary-address')?.textContent || ''}`;
    orderDetails += `\n*Ubicación:* ${ubicacionPais === 'venezuela' ? '🇻🇪 Venezuela' : '🌎 Fuera del país'}`;

    const facturaLabels = { 'ninguna': 'No necesita', 'fiscal': 'Factura fiscal', 'simple': 'Recibo simple' };
    if (facturaTipo !== 'ninguna') {
        orderDetails += `\n*Factura/Recibo:* ${facturaLabels[facturaTipo]}`;
        if (facturaTipo === 'fiscal' && facturaRif) {
            orderDetails += ` (RIF: ${facturaRif})`;
        }
        if (facturaTipo === 'simple' && facturaEmail) {
            orderDetails += ` (Email: ${facturaEmail})`;
        }
    }

    const newOrder = {
        id: orderId,
        cliente: {
            nombre: `${document.getElementById('ship-name')?.value || ''} ${document.getElementById('ship-lastname')?.value || ''}`,
            email: document.getElementById('ship-email')?.value || '',
            telefono: document.getElementById('ship-phone')?.value || '',
            direccion: document.getElementById('ship-address')?.value || '',
            ciudad: document.getElementById('ship-city')?.value || '',
            estado: document.getElementById('ship-state')?.value || ''
        },
        items: items,
        productosLocales: productosLocales.length,
        productosAfiliados: productosAfiliados.length,
        subtotal: subtotal,
        envio: shipping,
        iva: tax,
        total: total,
        metodo_pago: selectedPayment,
        factura: {
            tipo: facturaTipo,
            rif: facturaTipo === 'fiscal' ? facturaRif : '',
            email: facturaTipo === 'simple' ? facturaEmail : ''
        },
        ubicacion_pais: ubicacionPais,
        estado: 'pendiente',
        fecha: new Date().toISOString().split('T')[0]
    };
    let orders = JSON.parse(localStorage.getItem('carissma_orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('carissma_orders', JSON.stringify(orders));

    FirebaseService.addPedido(newOrder).catch(err => console.error('Error guardando pedido en Firebase:', err));

    if (productosAfiliados.length > 0) {
        const primerAfiliado = productosAfiliados[0].product;
        if (primerAfiliado.urlAfiliado) {
            setTimeout(() => {
                window.open(primerAfiliado.urlAfiliado, '_blank');
            }, 800);
        }
    }

    if (productosLocales.length > 0) {
        const phone = '584125274000';
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(orderDetails)}`;
        setTimeout(() => { window.open(waUrl, '_blank'); }, 1500);
    }

    currentStep = 4;
    updateStepUI();
    setTimeout(() => mostrarBotonesExito(productosAfiliados), 100);
}

function mostrarBotonesExito(productosAfiliados) {
    const container = document.getElementById('success-buttons');
    const localMsg = document.getElementById('success-message-local');
    if (!container) return;

    container.innerHTML = '';

    if (productosAfiliados.length > 0) {
        const linksAfiliados = productosAfiliados.map(item => {
            const url = item.product.urlAfiliado;
            if (!url) return '';
            return `<a href="${url}" target="_blank" rel="noopener" class="block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md">
                Ir a: ${item.product.nombre} (x${item.quantity})
            </a>`;
        }).filter(Boolean).join('');

        if (linksAfiliados) {
            container.innerHTML += `
                <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2">
                    <p class="text-xs text-orange-800 font-semibold mb-3">Tu pedido incluye productos de tienda externa. Haz clic en cada uno para adquirirlos:</p>
                    <div class="space-y-2">${linksAfiliados}</div>
                </div>
            `;
        }
    }

    const localItems = cart.filter(i => !i.product.esAfiliado);
    if (localItems.length === 0 && productosAfiliados.length > 0) {
        if (localMsg) localMsg.innerHTML = '<p class="text-xs text-gray-600 leading-relaxed">Tu pedido ha sido registrado. Sigue los enlaces de arriba para adquirir los productos en las tiendas externas.</p>';
    }

    container.innerHTML += `
        <button onclick="closeCheckoutModal()" class="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md cursor-pointer">
            Continuar Comprando
        </button>
    `;
}

function smoothScrollTo(targetY, duration) {
    duration = duration || 1200;
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    function step(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, startY + difference * ease);
        if (timeElapsed < duration) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

function smoothScrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        smoothScrollTo(offsetPosition, 1200);
    }
}

function scrollToTop() {
    smoothScrollTo(0, 1200);
}

window.addEventListener('scroll', function() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    if (window.scrollY > 300) {
        btn.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        btn.classList.add('translate-y-0', 'opacity-100');
    } else {
        btn.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        btn.classList.remove('translate-y-0', 'opacity-100');
    }
});
function cerrarTerminosAfiliados() {
    const modal = document.getElementById('affiliates-terms-modal');
    if (modal) {
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
}


function mostrarTerminosAfiliados() {
    const modal = document.getElementById('affiliates-terms-modal');
    const content = document.getElementById('affiliates-terms-content');
    if (!modal || !content) return;
    const config = getAffiliatesConfig();
    const tiendasActivas = ['Amazon', 'Temu', 'AliExpress'].filter(function(t) { return isTiendaActiva(t); });
    let html = '<p class="text-gray-600 mb-4">Al adquirir productos a traves de nuestros enlaces de afiliado, aceptas los terminos y condiciones de cada plataforma. A continuacion los terminos especificos por tienda:</p>';
    if (tiendasActivas.length === 0) {
        html += '<p class="text-gray-500 italic">No hay tiendas de afiliados activas en este momento.</p>';
    } else {
        tiendasActivas.forEach(function(tienda) {
            const tConfig = config.tiendas[tienda];
            if (tConfig && (tConfig.terminos || tConfig.tag)) {
                html += '<div class="border border-gray-200 rounded-xl p-4">';
                html += '<h4 class="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2">' + tienda + '</h4>';
                html += '<p class="text-gray-700 leading-relaxed">' + (tConfig.terminos || 'Terminos no configurados.') + '</p>';
                if (tConfig.tag) {
                    html += '<p class="text-[10px] text-gray-500 mt-2">Tag de afiliado: <code class="text-orange-600">' + tConfig.tag + '</code></p>';
                }
                html += '</div>';
            }
        });
    }
    content.innerHTML = html;
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}
