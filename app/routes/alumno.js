const express = require('express');
const controller = require('../controllers/alumno');
const router = express.Router();

const path = 'alumno';
/**
 * @swagger
 * /alumno:
 *   get:
 *     summary: Obtener datos de alumno
 *     tags: [Alumno]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de alumno.
 *     responses:
 *      200:
 *        description: Datos de alumno obtenidos correctamente.
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