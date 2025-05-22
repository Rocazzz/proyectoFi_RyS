require('dotenv').config(); // ¡MUY IMPORTANTE: Cargar las variables de entorno al inicio!

const express = require('express');
const usuarioController = require('./controllers/usuarioController');
const morgan = require('morgan');
const mongoose = require('mongoose'); // Agregado para la conexión a DB

const app = express();
const PORT = process.env.PORT || 3000; // Usar el puerto del .env

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Conexión a MongoDB para usuarios
const MONGODB_URI_USERS = process.env.MONGODB_URI_USERS || "mongodb://localhost:27017/users_db";
mongoose.connect(MONGODB_URI_USERS)
  .then(() => console.log("Conectado a MongoDB: users_db"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));


app.use('/api', usuarioController); // Montar el controlador de usuarios con prefijo /api

app.listen(PORT, () => {
  console.log(`Microservicio de Usuarios ejecutándose en http://localhost:${PORT}`);
});