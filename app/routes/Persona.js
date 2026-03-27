const express = require('express');
const controller = require('../controllers/Persona');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'persona';

router.post(`/${path}/BuscarMaestro`, controller.buscarMaestros);

router.post(`/${path}/CrearMaestro`, controller.crearMaestro);

router.post(`/${path}/ActualizarMaestro`, controller.actualizarMaestro);

router.post(`/${path}/EliminarMaestro`, controller.eliminarMaestro);

module.exports = router;