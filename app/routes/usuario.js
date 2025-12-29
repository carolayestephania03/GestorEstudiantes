const express = require('express');
const controller = require('../controllers/Usuario');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'usuario';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/Crear`, controller.postData);
/**
 * @swagger
 * /usuario/Login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     description: Verifica el usuario y contraseña en la base de datos y genera JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificador
 *               - contrasena
 *             properties:
 *               identificador:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

router.post(`/${path}/Login`, controller.login);

router.put(`/${path}/Actualizar`, controller.putData);

module.exports = router;