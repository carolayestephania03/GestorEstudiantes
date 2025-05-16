const express = require('express');
const controller = require('../controllers/encargado');
const router = express.Router();

const path = 'encargado';
/**
 * @swagger
 * /encargado:
 *   get:
 *     summary: Obtener datos del encargado
 *     tags: [Encargado]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos del Encargado.
 *     responses:
 *      200:
 *        description: Datos del Encargado obtenidos correctamente.
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