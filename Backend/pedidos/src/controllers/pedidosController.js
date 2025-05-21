const express = require('express');
const router = express.Router();
const db = require('../db'); 


// Crear nuevo pedido
router.post('/pedidos', async (req, res) => {
    const { usuario_id, items } = req.body;

    if (!usuario_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [pedidoResult] = await conn.execute(
            `INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)`,
            [usuario_id, total]
        );

        const pedidoId = pedidoResult.insertId;

        const itemInserts = items.map(item =>
            conn.execute(
                `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
                [pedidoId, item.producto_id, item.cantidad, item.precio_unitario]
            )
        );

        await Promise.all(itemInserts);
        await conn.commit();

        res.status(201).json({ mensaje: 'Pedido creado', pedidoId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: 'Error al crear el pedido' });
    } finally {
        conn.release();
    }
});

// Obtener todos los pedidos
router.get('/pedidos', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM pedidos');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// Obtener detalle de un pedido
router.get('/pedidos/:id', async (req, res) => {
    const pedidoId = req.params.id;

    try {
        const [[pedido]] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        const [items] = await db.execute('SELECT * FROM pedido_items WHERE pedido_id = ?', [pedidoId]);

        res.json({ pedido, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle del pedido' });
    }
});

// Actualizar estado del pedido
router.put('/pedidos/:id', async (req, res) => {
    const pedidoId = req.params.id;
    const { estado } = req.body;

    if (!['pendiente', 'enviado', 'entregado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const [result] = await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, pedidoId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

module.exports = router;
