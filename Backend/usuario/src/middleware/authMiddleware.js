// authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel'); // Ruta a tu modelo de usuario

// ¡IMPORTANTE! La clave secreta ahora se toma de process.env.JWT_SECRET
// Si por alguna razón el .env no carga (lo cual ya solucionamos), tendría un fallback.
// Pero la idea es que process.env.JWT_SECRET sea el valor que definiste en .env
const secret = process.env.JWT_SECRET || 'mi_clave_secreta_por_defecto_NO_USAR_EN_PRODUCCION';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token mal formado' });

  try {
    const payload = jwt.verify(token, secret); // Aquí se usa la 'secret' para verificar
    const usuario = await Usuario.findById(payload.id); // Asumiendo que tu modelo tiene findById
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = usuario; // Adjunta el usuario al objeto de la solicitud
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    res.status(401).json({ error: 'Token inválido', detalle: error.message });
  }
}

module.exports = { authMiddleware, secret }; // Exportamos authMiddleware y la secret