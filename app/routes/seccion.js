const express = require('express');
const controller = require('../controllers/seccion');
const router = express.Router();

const path = 'seccion';

router.get(`/${path}`, controller.obtenerSecciones);
router.get(`/${path}/:id`, controller.obtenerSeccion);
router.post(`/${path}`, controller.crearSeccion);
router.put(`/${path}/:id`, controller.actualizarSeccion);
router.delete(`/${path}/:id`, controller.eliminarSeccion);

module.exports = router;