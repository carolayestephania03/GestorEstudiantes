const express = require('express');
const controller = require('../controllers/alumno');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'alumno';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/Buscar`, controller.buscarAlumnosConMaestros);

router.post(`/${path}/buscarAlumnos`, controller.buscarAlumnosSimple);

router.post(`/${path}/CrearAlumno`, controller.crearAlumnoConEncargado);

router.put(`/${path}/ActualizarAlumno`, controller.actualizarAlumnoConEncargado);

module.exports = router;