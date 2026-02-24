const express = require('express');
const controller = require('../controllers/alumno');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'alumno';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/Buscar`, controller.buscarAlumnosConMaestros);

module.exports = router;