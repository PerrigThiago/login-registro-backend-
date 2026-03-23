import express from 'express';
import {
    registro,
    login,
    logout,
    verificarEmail
} from '../controllers/usuarioController.js';

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/verificar', verificarEmail);
router.post('/logout', logout);

export default router;