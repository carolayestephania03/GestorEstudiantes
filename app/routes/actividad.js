const express = require('express');
const controller = require('../controllers/actividad');
const router = express.Router();

const path = 'actividad';

router.get(`/${path}`, controller.getActividades);
router.get(`/${path}/:id_actividad`, controller.getActividadById);
router.post(`/${path}`, controller.createActividad);
router.put(`/${path}/:id_actividad`, controller.updateActividad);
router.delete(`/${path}/:id_actividad`, controller.deleteActividad);

module.exports = router;