const express = require('express');
const controller = require('../controllers/Tipo_actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'tipoActividad';

router.get(`/${path}`, controller.getData);

module.exports = router;