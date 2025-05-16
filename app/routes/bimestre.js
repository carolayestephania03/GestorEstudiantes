const express = require('express');
const controller = require('../controllers/bimestre');
const router = express.Router();

const path = 'bimestre';
/**
 * @swagger
 * /bimestre:
 *   get:
 *     summary: Obtener datos del bimestre
 *     tags: [Bimestre]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos del bimestre.
 *     responses:
 *      200:
 *        description: Datos del bimestre obtenidos correctamente.
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