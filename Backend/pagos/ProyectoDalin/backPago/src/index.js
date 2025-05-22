const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pagosController = require('./controllers/pagosController');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(pagosController);

app.listen(3301, () => {
    console.log('Microservicio de pagos corriendo en el puerto 3301');
});
