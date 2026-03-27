const express = require('express');
const controller = require('../controllers/encargado');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'encargado';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/BuscarEncargado`, controller.buscarEncargadosConAlumnos);

router.post(`/${path}/CrearEncargado`, controller.crearEncargado);

router.put(`/${path}/ActualizarEncargado`, controller.actualizarEncargado);

module.exports = router;