const express = require('express');
const controller = require('../controllers/bitacora');
const router = express.Router();

const path = 'bitacora';
/**
 * @swagger
 * /bitacora:
 *   get:
 *     summary: Obtener datos del bitacora
 *     tags: [Bitacora]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de la bitacora.
 *     responses:
 *      200:
 *        description: Datos de la bitacora obtenidos correctamente.
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