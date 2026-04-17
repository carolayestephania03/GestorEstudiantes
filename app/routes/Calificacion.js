const express = require('express');
const controller = require('../controllers/Calificacion');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'calificacion';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/promedioAlumnos`, controller.getAlumnMejProm);

router.post(`/${path}/reporteNotasMateriasBimestre`, controller.repNotasMateriasBimestre);

router.post(`/${path}/reporteNotasListaCotejo`, controller.repNotasListaCotejo);

router.post(`/${path}/guardarCalificacion`, controller.guardarActualizarCalificacion);

module.exports = router;