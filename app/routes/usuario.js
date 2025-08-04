const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario');
const path = 'usuario';

/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Endpoints para operaciones con usuarios
 */

/**
 * @swagger
 * /usuario:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error en el servidor
 */
router.get(`/${path}`, controller.getData);

/**
 * @swagger
 * /usuario/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get(`/${path}/:id`, controller.getById);

/**
 * @swagger
 * /usuario:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - nombre
 *               - correo
 *               - telefono
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 contrasena_temporal:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Correo ya en uso
 *       500:
 *         description: Error del servidor
 */
router.post(`/${path}`, controller.postData);

module.exports = router;
