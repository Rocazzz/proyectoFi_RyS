const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3005;

app.get('/pago', async (req, res) => {
  try {
    const productos = await axios.get('http://localhost:3003/carrito/productos');
    const total = productos.data.reduce((sum, p) => sum + p.precio, 0);

    res.json({
      total,
      estado: 'pendiente de pago'
    });
  } catch (error) {
    res.status(500).send('Error al calcular el pago');
  }
});

app.listen(PORT, () => console.log(`Pagos corriendo en http://localhost:${PORT}`));
