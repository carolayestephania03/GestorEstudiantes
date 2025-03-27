const express = require('express');
const controller = require('../controllers/aviso_actividad');
const router = express.Router();

const path = 'aviso_actividad';

router.get(`/${path}`, controller.getAvisoActividades);
router.get(`/${path}/:id_aviso_actividad`, controller.getAvisoActividadById);
router.post(`/${path}`, controller.createAvisoActividad);
router.put(`/${path}/:id_aviso_actividad`, controller.updateAvisoActividad);
router.delete(`/${path}/:id_aviso_actividad`, controller.deleteAvisoActividad);

module.exports = router;
