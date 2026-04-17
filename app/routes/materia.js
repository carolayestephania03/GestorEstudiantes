const express = require('express');
const controller = require('../controllers/materia');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'materia';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/ActividadesPenyCum`, controller.getActPenyCum);

router.post(`/${path}/crearMateria`, controller.crearMateria);

router.put(`/${path}/actualizarMateria`, controller.actualizarMateria);

module.exports = router;