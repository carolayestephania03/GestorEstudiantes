const express = require('express');
const controller = require('../controllers/calificacion_actividad');
const router = express.Router();

const path = 'calificacion_actividad';

router.get(`/${path}`, controller.getCalificacionActividades);
router.get(`/${path}/:id_calificacion_actividad`, controller.getCalificacionActividadById);
router.post(`/${path}`, controller.createCalificacionActividad);
router.put(`/${path}/:id_calificacion_actividad`, controller.updateCalificacionActividad);
router.delete(`/${path}/:id_calificacion_actividad`, controller.deleteCalificacionActividad);

module.exports = router;
