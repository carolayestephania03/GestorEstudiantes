const express = require('express');
const controller = require('../controllers/rol');
const router = express.Router();

const path = 'rol';
/**
 * @swagger
 * /rol:
 *   get:
 *     summary: Obtener datos de los roles
 *     tags: [Rol]
 *     security:
 *      - bearerAuth: []
 *     description: Obtiene los datos de los roles
 *     responses:
 *      200:
 *        description: Datos de los roles obtenidos correctamente.
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