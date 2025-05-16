const express = require('express');
const controller = require('../controllers/ciclo');
const router = express.Router();

const path = 'ciclo';
/**
 * @swagger
 * /ciclo:
 *   get:
 *     summary: Obtener datos del ciclo
 *     tags: [Ciclo]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos del Ciclo.
 *     responses:
 *      200:
 *        description: Datos del Ciclo obtenidos correctamente.
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