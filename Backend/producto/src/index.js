require('dotenv').config(); // ¡MUY IMPORTANTE: Cargar las variables de entorno al inicio!

const express = require("express");
const mongoose = require("mongoose");
const morgan = require('morgan');
const productosController = require('./controllers/productosController'); // Importa tu controlador de productos

const app = express();
const PORT = process.env.PORT || 3002;

// --- LÍNEAS PARA DEPURACIÓN DE JWT_SECRET (dejarlas si sigues debuggeando) ---
console.log('--- Verificando JWT_SECRET en productos ---');
console.log('Valor de process.env.JWT_SECRET:', process.env.JWT_SECRET);
console.log('--- Fin de verificación ---');
// --- FIN DE LÍNEAS PARA DEPURACIÓN DE JWT_SECRET ---

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI_PRODUCTS = process.env.MONGODB_URI_PRODUCTS || "mongodb://localhost:27017/products_db";
mongoose.connect(MONGODB_URI_PRODUCTS)
  .then(() => console.log("Conectado a MongoDB: products_db"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

// Rutas de productos (montando el controlador)
app.use('/api', productosController);

// Ruta de prueba básica para el microservicio de productos
app.get('/', (req, res) => {
  res.send('Microservicio de Productos funcionando. Visita /api/productos para las rutas de productos.');
});

app.listen(PORT, () => console.log(`Microservicio de Productos corriendo en http://localhost:${PORT}`));