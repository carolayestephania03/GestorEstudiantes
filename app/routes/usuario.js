const express = require('express');
const controller = require('../controllers/usuario');
const router = express.Router();

const path = 'usuario';
/**
 * @swagger
 * /usuario:
 *   get:
 *     summary: Obtener datos de los usuarios
 *     tags: [Usuario]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de los usuarios
 *     responses:
 *      200:
 *        description: Datos de los usuarios obtenidos correctamente.
 *        content:
 *         application/json:
 *          schema:
 *           type: object
 *          properties:
 *           data:
 *            type: array
 *           items:
 *            type: object
 *      500:
 *       description: Error interno del servidor.
 */


router.get(`/${path}`, controller.getData);


module.exports = router;