const express = require('express');
const controller = require('../controllers/alumno');
const router = express.Router();

const path = 'alumno';

router.get(`/${path}`, controller.getAlumnos);
router.get(`/${path}/:id_alumno`, controller.getAlumnoById);
router.post(`/${path}`, controller.createAlumno);
router.put(`/${path}/:id_alumno`, controller.updateAlumno);
router.delete(`/${path}/:id_alumno`, controller.deleteAlumno);

module.exports = router;