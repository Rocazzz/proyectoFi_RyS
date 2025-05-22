const { Router } = require('express');
const router = Router();
const pagosModel = require('../models/pagoModel'); // corregido nombre

// Ejemplo básico de función para validar método de pago
function validarMetodoPago(tipo, detalle) {
  // Agrega aquí la lógica para validar según tipo
  // Por ejemplo, si tipo es "tarjeta", que detalle tenga campos específicos
  if (!tipo || !detalle) return false;
  // Ejemplo simple:
  if (tipo === 'tarjeta') {
    return detalle.numero && detalle.vencimiento;
  }
  return true; // para otros tipos, permitir por defecto
}

// POST /pagos
router.post('/', async (req, res) => {
    const { cliente_id, tipo, detalle, guardar } = req.body;

    if (!cliente_id || !tipo || !detalle) {
        return res.status(400).send("Faltan datos obligatorios.");
    }

    const existe = await pagosModel.clienteExiste(cliente_id);
    if (!existe) {
        return res.status(404).send("Cliente no encontrado.");
    }

    if (!validarMetodoPago(tipo, detalle)) {
        return res.status(400).send("Método de pago no válido.");
    }

    try {
        if (guardar) {
            await pagosModel.guardarMetodoPago(cliente_id, tipo, detalle);
        }
        res.send("Pago exitoso.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al procesar el pago.");
    }
});

// GET /pagos/:cliente_id
router.get('/:cliente_id', async (req, res) => {
    const { cliente_id } = req.params;

    const existe = await pagosModel.clienteExiste(cliente_id);
    if (!existe) {
        return res.status(404).send("Cliente no encontrado.");
    }

    try {
        const metodos = await pagosModel.obtenerMetodosPago(cliente_id);
        res.json(metodos);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener métodos de pago.");
    }
});

// DELETE /pagos/:metodo_id
router.delete('/:metodo_id', async (req, res) => {
    const { metodo_id } = req.params;
    const { cliente_id } = req.body;  // Mejor usar JWT en producción

    if (!cliente_id) {
        return res.status(400).send("Se requiere cliente_id.");
    }

    const autorizado = await pagosModel.metodoPerteneceAlCliente(metodo_id, cliente_id);
    if (!autorizado) {
        return res.status(403).send("No autorizado para eliminar este método de pago.");
    }

    try {
        await pagosModel.eliminarMetodoPago(metodo_id);
        res.status(200).send("Método de pago eliminado.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al eliminar el método de pago.");
    }
});

module.exports = router;
