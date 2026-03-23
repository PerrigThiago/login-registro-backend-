import pool from '../config/bd.js';

// ✅ Crear usuario con token
export const crearUsuario = async (gmail, nombre, contrasenia, token) => {
    const resultado = await pool.query(
        `INSERT INTO usuario (gmail, nombre, contrasenia, text_verificacion, verificado) 
         VALUES ($1, $2, $3, $4, false) 
         RETURNING *`,
        [gmail, nombre, contrasenia, token]
    );
    return resultado.rows[0];
};

// 🔍 Obtener por gmail
export const obtenerUsuarioPorGmail = async (gmail) => {
    const resultado = await pool.query(
        `SELECT * FROM usuario WHERE gmail = $1`,
        [gmail]
    );
    return resultado.rows[0];
};

// 🔍 Obtener por ID
export const obtenerUsuarioPorId = async (id_usuario) => {
    const resultado = await pool.query(
        `SELECT id_usuario, gmail, nombre FROM usuario WHERE id_usuario = $1`,
        [id_usuario]
    );
    return resultado.rows[0];
};

// 🔍 Obtener por token
export const obtenerUsuarioPorToken = async (token) => {
    const resultado = await pool.query(
        `SELECT * FROM usuario WHERE text_verificacion = $1`,
        [token]
    );
    return resultado.rows[0];
};

// ✅ Verificar usuario
export const verificarUsuario = async (token) => {
    await pool.query(
        `UPDATE usuario 
         SET verificado = true, text_verificacion = NULL 
         WHERE text_verificacion = $1`,
        [token]
    );
};