// src/routes/pedidosRoutes.js

const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController'); // ¡Importa el controlador!

// Define tus rutas asociando el método HTTP y la ruta con las funciones del controlador
router.post('/pedidos', pedidosController.createPedido);
router.get('/pedidos', pedidosController.getAllPedidos);
router.get('/pedidos/:id', pedidosController.getPedidoById);
router.put('/pedidos/:id', pedidosController.updatePedido);
router.delete('/pedidos/:id', pedidosController.deletePedido); // Si tienes esta ruta

module.exports = router; // ¡Exporta el router!