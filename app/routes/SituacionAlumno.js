const express = require('express');
const controller = require('../controllers/SituacionAlumno');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'situacion';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/CrearSituacion`, controller.postData);

router.put(`/${path}/ActualizarSituacion`, controller.putData);

router.delete(`/${path}/EliminarSituacion`, controller.deleteData);

module.exports = router;