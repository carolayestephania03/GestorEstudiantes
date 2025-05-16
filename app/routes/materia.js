const express = require('express');
const controller = require('../controllers/materia');
const router = express.Router();

const path = 'materia';
/**
 * @swagger
 * /materia:
 *   get:
 *     summary: Obtener datos de la materia
 *     tags: [Materia]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de la materia.
 *     responses:
 *      200:
 *        description: Datos de la materia obtenidos correctamente.
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