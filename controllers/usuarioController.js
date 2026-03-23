import * as Usuario from '../models/usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,   // ✅ Desde .env
        pass: process.env.EMAIL_PASS    // ✅ App Password de Gmail
    }
});

export const registro = async (req, res) => {
    try {
        const { gmail, nombre, contrasenia } = req.body;

        if (!gmail || !nombre || !contrasenia) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const usuarioExiste = await Usuario.obtenerUsuarioPorGmail(gmail);
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El gmail ya está registrado' });
        }

        const hash = await bcrypt.hash(contrasenia, 10);
        const token = uuidv4();

        await Usuario.crearUsuario(gmail, nombre, hash, token);

        const link = `${process.env.BACKEND_URL}/api/auth/verificar?token=${token}`; // ✅ Desde .env

        await transporter.sendMail({
            from: `"Mi App" <${process.env.EMAIL_USER}>`,  // ✅ from obligatorio
            to: gmail,
            subject: "Verificá tu cuenta",
            html: `
                <h2>Hola ${nombre}</h2>
                <p>Hacé click para activar tu cuenta:</p>
                <a href="${link}">Verificar cuenta</a>
            `
        });

        res.status(201).json({ mensaje: 'Usuario registrado. Revisá tu email.' });

    } catch (error) {
        console.error('Error en registro:', error); // ✅ Para debuggear
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

export const verificarEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const usuario = await Usuario.obtenerUsuarioPorToken(token);

        if (!usuario) {
            return res.status(400).send("Token inválido");
        }

        await Usuario.verificarUsuario(token);

        res.redirect(`${process.env.FRONTEND_URL}/verificado`); // ✅ Desde .env

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).send("Error al verificar");
    }
};

export const login = async (req, res) => {
    try {
        const { gmail, contrasenia } = req.body;

        const usuario = await Usuario.obtenerUsuarioPorGmail(gmail);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!usuario.verificado) {
            return res.status(403).json({ error: 'Debes verificar tu email primero' });
        }

        const valida = await bcrypt.compare(contrasenia, usuario.contrasenia);
        if (!valida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario, gmail: usuario.gmail },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }  // ✅ Expiración agregada
        );

        res.json({ token });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

export const logout = async (req, res) => {
    res.json({ mensaje: 'Sesión cerrada' }); // ✅ Typo corregido
};
