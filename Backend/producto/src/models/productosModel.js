const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    // Ya no necesitas 'id' si vas a usar el _id por defecto de MongoDB
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String },
    precio: { type: Number, required: true, min: 0 },
    categoria: { type: String },
    stock: { type: Number, required: true, min: 0 },
    imagenURL: { type: String },
    fechaCreacion: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', productoSchema);

async function getProductos(page = 1, limit = 10, nombre = '', categoria = '') {
    const query = {};
    if (nombre) query.nombre = { $regex: nombre, $options: 'i' };
    if (categoria) query.categoria = categoria;

    return await Producto
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
}

async function getProductoById(id) {
    return await Producto.findById(id).lean();
}

async function createProducto(nombre, descripcion, precio, categoria, stock, imagenURL) {
    const producto = new Producto({
        nombre,
        descripcion,
        precio,
        categoria,
        stock,
        imagenURL
    });
    return await producto.save();
}

async function updateProducto(id, nombre, descripcion, precio, categoria, stock, imagenURL) {
    return await Producto.findByIdAndUpdate(
        id,
        { nombre, descripcion, precio, categoria, stock, imagenURL },
        { new: true, runValidators: true }
    );
}

async function deleteProducto(id) {
    return await Producto.findByIdAndDelete(id);
}

module.exports = {
    getProductos,
    getProductoById, // Este ya usa findById que busca por el _id de MongoDB
    createProducto,
    updateProducto,
    deleteProducto
};