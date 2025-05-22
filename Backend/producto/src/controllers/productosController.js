const { Router } = require('express');
const router = Router();
const productosModel = require('../models/productosModel'); // Asegúrate de que esta ruta sea correcta
const jwt = require('jsonwebtoken');

// IMPORTANTE: La clave secreta para JWT debe venir de una variable de entorno.
// Debe ser la MISMA clave que usas en tu microservicio de usuarios para firmar los tokens.
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_por_defecto_NO_USAR_EN_PRODUCCION';
// ^^^^ Asegúrate de que esta variable JWT_SECRET esté definida en tu archivo .env del microservicio de productos.

// Middleware para verificar JWT y rol de administrador
// productoController.js
function verifyAdmin(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        }
        req.user = decoded; // Adjunta el payload del token
        next();
    } catch (err) {
        console.error('Error de verificación de token en verifyAdmin:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado, por favor inicia sesión nuevamente' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido, verifica la firma del token', detalle: err.message });
        }
        res.status(401).json({ error: 'Token inválido o expirado', detalle: err.message });
    }
}


// Todas las rutas aquí YA tienen el prefijo '/api'
// gracias a `app.use('/api', productoController);` en `index.js`.
// Por lo tanto, las URLs finales serán: /api/productos, /api/productos/:id, etc.

// 1. GET /productos - Listar productos (paginación y filtros)
router.get('/productos', async (req, res) => {
    try {
        const { page = 1, limit = 10, nombre = '', categoria = '' } = req.query;
        const productos = await productosModel.getProductos(parseInt(page), parseInt(limit), nombre, categoria);
        res.json(productos);
    } catch (err) {
        console.error('Error en GET /productos:', err); // Para depuración
        res.status(500).json({ error: 'Error interno del servidor al listar productos', detalle: err.message });
    }
});

// 2. GET /productos/:id - Obtener detalle de un producto por su _id de MongoDB
router.get('/productos/:id', async (req, res) => {
    try {
        // Asumimos que req.params.id es el _id (ObjectId) de MongoDB
        const producto = await productosModel.getProductoById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (err) {
        // Manejar el error si el ID no es un ObjectId válido (Mongoose CastError)
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un ID válido de MongoDB.' });
        }
        console.error('Error en GET /productos/:id:', err); // Para depuración
        res.status(500).json({ error: 'Error interno del servidor al obtener producto', detalle: err.message });
    }
});

// 3. POST /productos - Crear producto (solo admin)
router.post('/productos', verifyAdmin, async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria, stock, imagenURL } = req.body;
        // Validaciones básicas de entrada
        if (!nombre || !precio || !stock) {
            return res.status(400).json({ error: 'Nombre, precio y stock son campos requeridos.' });
        }
        const producto = await productosModel.createProducto(nombre, descripcion, precio, categoria, stock, imagenURL);
        res.status(201).json(producto); // 201 Created
    } catch (err) {
        console.error('Error en POST /productos:', err); // Para depuración
        res.status(400).json({ error: 'Error al crear producto', detalle: err.message });
    }
});

// 4. PUT /productos/:id - Editar producto (solo admin)
router.put('/productos/:id', verifyAdmin, async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria, stock, imagenURL } = req.body;
        // Puedes añadir validaciones aquí si lo necesitas
        const producto = await productosModel.updateProducto(req.params.id, nombre, descripcion, precio, categoria, stock, imagenURL);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un ID válido de MongoDB.' });
        }
        console.error('Error en PUT /productos/:id:', err); // Para depuración
        res.status(400).json({ error: 'Error al actualizar producto', detalle: err.message });
    }
});

// 5. DELETE /productos/:id - Eliminar producto (solo admin)
router.delete('/productos/:id', verifyAdmin, async (req, res) => {
    try {
        const producto = await productosModel.deleteProducto(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de producto inválido. Debe ser un ID válido de MongoDB.' });
        }
        console.error('Error en DELETE /productos/:id:', err); // Para depuración
        res.status(500).json({ error: 'Error interno del servidor al eliminar producto', detalle: err.message });
    }
});

module.exports = router;