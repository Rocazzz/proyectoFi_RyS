const express = require('express');
const pedidosController = require('./controllers/pedidosController.js');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(pedidosController);
app.listen(3001, () => {
    console.log('backPedidos ejecutandose en el puerto 3001');
   });