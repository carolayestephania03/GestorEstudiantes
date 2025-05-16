const express = require('express');
const controller = require('../controllers/seccion');
const router = express.Router();

const path = 'seccion';
/**
 * @swagger
 * /seccion:
 *   get:
 *     summary: Obtener datos de las secciones
 *     tags: [Seccion]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de las secciones
 *     responses:
 *      200:
 *        description: Datos de las secciones obtenidos correctamente.
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