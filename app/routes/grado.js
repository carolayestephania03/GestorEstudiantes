const express = require('express');
const controller = require('../controllers/Grado');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'grado';

/**
 * @swagger
 * /grado:
 *   get:
 *     summary: Obtiene todos los grados
 *     tags: [Grado]
 *     description: Retorna una lista de todos los grados de la base de datos
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get(`/${path}`, controller.getData);

module.exports = router;