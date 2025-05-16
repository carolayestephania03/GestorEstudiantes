const express = require('express');
const controller = require('../controllers/grado');
const router = express.Router();

const path = 'grado';
/**
 * @swagger
 * /grado:
 *   get:
 *     summary: Obtener datos del grado
 *     tags: [Grado]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos del Grado.
 *     responses:
 *      200:
 *        description: Datos del Grado obtenidos correctamente.
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