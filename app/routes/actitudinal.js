const express = require('express');
const controller = require('../controllers/actitudinal');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'Actitudinal';

router.get(`/${path}/topicosActitudinal`, controller.getDataTopicos);

router.post(`/${path}/ConfigurarNotas`, controller.configuracionNotas);

router.post(`/${path}/obtenerActitudinal`, controller.obtenerActitudinalAlumnos);

router.post(`/${path}/GuardarActitudinal`, controller.guardarActitudinalAlumnos);

router.post(`/${path}/crearTopicoActitudinal`, controller.crearTopicoActitudinal);

router.put(`/${path}/actualizarTopicoActitudinal`, controller.actualizarTopicoActitudinal);

router.delete(`/${path}/eliminarTopicoActitudinal`, controller.eliminarTopicoActitudinal);

module.exports = router;