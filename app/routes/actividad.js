const express = require('express');
const controller = require('../controllers/actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'actividad';

router.post(`/${path}`, controller.getActividadesData);

router.post(`/${path}/ActividadDetalle`, controller.getActividadDetalle);

router.post(`/${path}/GradoMateria`, controller.getActividadesPorMateria);

router.post(`/${path}/NotasClase`, controller.getNotasDetallePorClase);

module.exports = router;