const express = require('express');
const controller = require('../controllers/actividad');
const router = express.Router();

const path = 'actividad';

/**
 * @swagger
 * /actividad:
 *   get:
 *     summary: Obtener datos de actividad
 *     tags: [Actividad]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de actividad.
 *     responses:
 *      200:
 *        description: Datos de actividad obtenidos correctamente.
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