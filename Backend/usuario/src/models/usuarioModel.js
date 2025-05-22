const pool = require('../db');
const bcrypt = require('bcrypt');

class Usuario {
  static async create({ username, email, password, rol = 'cliente' }) {
    // Validaciones defensivas
    if (!username || !email || !password) {
      throw new Error('username, email y password son requeridos');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, email, password_hash, rol) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [username, email, password_hash, rol]);

    const [rows] = await pool.execute(
      `SELECT id, username, email, rol, fecha_creacion, estado FROM users WHERE id = ?`,
      [result.insertId]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ? AND estado = 'activo'`;
    const [rows] = await pool.execute(sql, [email]);
    return rows[0];
  }

  static async findById(id) {
    const sql = `SELECT * FROM users WHERE id = ? AND estado = 'activo'`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { username, email, password } = data;

    const usuario = await this.findById(id);
    if (!usuario) return null;

    let password_hash = usuario.password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const newUsername = username || usuario.username;
    const newEmail = email || usuario.email;

    const sql = `UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?`;
    await pool.execute(sql, [newUsername, newEmail, password_hash, id]);

    return this.findById(id);
  }

  static async deactivate(id) {
    const sql = `UPDATE users SET estado = 'inactivo' WHERE id = ? AND estado = 'activo'`;
    const [result] = await pool.execute(sql, [id]);
    if (result.affectedRows === 0) return null;
    return true;
  }
}

module.exports = Usuario;
