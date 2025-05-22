const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Asegúrate de que esta ruta sea correcta y que authMiddleware.js exporte 'authMiddleware' y 'secret'
const { authMiddleware, secret } = require('../middleware/authMiddleware');

// POST /registro - Crear usuario
router.post('/registro', async (req, res) => {
    const { username, email, password, rol } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email y password son requeridos' });
    }

    try {
        const existente = await Usuario.findByEmail(email);
        if (existente) {
            return res.status(400).json({ error: 'Email ya registrado' });
        }

        const nuevoUsuario = await Usuario.create({ username, email, password, rol });

        const { password_hash, ...usuarioSinPass } = nuevoUsuario;
        res.status(201).json(usuarioSinPass);
    } catch (error) {
        console.error('Error en /registro:', error);
        res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
    }
});

// POST /login - Iniciar sesión de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    try {
        const usuario = await Usuario.findByEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            id: usuario._id,
            username: usuario.username,
            email: usuario.email,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        res.json({ message: 'Login exitoso', token, user: payload });
    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message });
    }
});

// GET /perfil - Obtener datos del usuario autenticado (protegida con authMiddleware)
router.get('/perfil', authMiddleware, (req, res) => {
    const { password_hash, ...usuarioSinPass } = req.user;
    res.json(usuarioSinPass);
});

// PUT /perfil - Actualizar datos del usuario autenticado (protegida con authMiddleware)
router.put('/perfil', authMiddleware, async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const actualizado = await Usuario.update(req.user._id, { username, email, password });
        if (!actualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const { password_hash, ...usuarioSinPass } = actualizado.toObject();
        res.json(usuarioSinPass);
    } catch (error) {
        console.error('Error en PUT /perfil:', error);
        res.status(500).json({ error: 'Error al actualizar usuario', detalle: error.message });
    }
});

// DELETE /perfil - Desactivar usuario autenticado (protegida con authMiddleware)
router.delete('/perfil', authMiddleware, async (req, res) => {
    try {
        const desactivado = await Usuario.deactivate(req.user._id);
        if (!desactivado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
        console.error('Error en DELETE /perfil:', error);
        res.status(500).json({ error: 'Error al desactivar usuario', detalle: error.message });
    }
});

module.exports = router;