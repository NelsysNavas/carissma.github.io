const FirebaseService = {

    async getProductos() {
        try {
            const snapshot = await db.collection('productos').orderBy('nombre').get();
            const productos = [];
            snapshot.forEach(doc => {
                productos.push({ id: doc.id, ...doc.data() });
            });
            return productos;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    },

    async getProducto(id) {
        try {
            const doc = await db.collection('productos').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return null;
        }
    },

    async addProducto(producto) {
        try {
            const docRef = await db.collection('productos').add(producto);
            return { id: docRef.id, ...producto };
        } catch (error) {
            console.error('Error al agregar producto:', error);
            throw error;
        }
    },

    async updateProducto(id, data) {
        try {
            await db.collection('productos').doc(id).update(data);
            return true;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    },

    async deleteProducto(id) {
        try {
            await db.collection('productos').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    },

    async addPedido(pedido) {
        try {
            const docRef = await db.collection('pedidos').add(pedido);
            return { id: docRef.id, ...pedido };
        } catch (error) {
            console.error('Error al guardar pedido:', error);
            throw error;
        }
    },

    async updatePedido(id, data) {
        try {
            await db.collection('pedidos').doc(id).update(data);
            return true;
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            throw error;
        }
    },

    async getPedido(id) {
        try {
            const doc = await db.collection('pedidos').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error al obtener pedido:', error);
            return null;
        }
    },

    async getPedidos() {
        try {
            const snapshot = await db.collection('pedidos').orderBy('fecha', 'desc').get();
            const pedidos = [];
            snapshot.forEach(doc => {
                pedidos.push({ id: doc.id, ...doc.data() });
            });
            return pedidos;
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            return [];
        }
    },

    async migrarProductosDemo(productosDemo) {
        try {
            const existentes = await this.getProductos();
            if (existentes.length > 0) {
                console.log('Firebase ya tiene productos. No se migraron demos.');
                return existentes;
            }
            console.log('Migrando productos demo a Firebase...');
            for (const producto of productosDemo) {
                const { id, ...data } = producto;
                await db.collection('productos').add(data);
            }
            console.log('Productos demo migrados exitosamente');
            return await this.getProductos();
        } catch (error) {
            console.error('Error en migración:', error);
            throw error;
        }
    }
};
