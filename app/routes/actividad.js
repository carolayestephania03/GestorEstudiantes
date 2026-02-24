const express = require('express');
const controller = require('../controllers/actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'actividad';

router.post(`/${path}`, controller.getActividadesData);

router.post(`/${path}/ActividadDetalle`, controller.getActividadDetalle);

router.post(`/${path}/GradoMateria`, controller.getActividadesPorMateria);

router.post(`/${path}/NotasClase`, controller.getNotasDetallePorClase);

/**NUEVO */
router.post(`/${path}/NotasGradoSec`, controller.getTareasPendientesPorMateria);

router.post(`/${path}/CalificacionesGradoSec`, controller.getCalificacionesAlumnosPorMateria);

router.post(`/${path}/ActividadesPorTipo`, controller.getActividadesPorTipo);

/**ACA */

router.post(`/${path}/ActividadesCalificadasPorTipo`, controller.getActividadesCalificadasPorMateria);

router.post(`/${path}/ActividadesCalificadasPorAlumno`, controller.getNotasAlumnosTareasCalificadas);

router.post(`/${path}/ActividadesAgrupadasPorAviso`, controller.getTareasAgrupadasPorAviso);

module.exports = router;