const express = require('express');
const controller = require('../controllers/Estado_actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'EstadoActividad';

router.get(`/${path}`, controller.getData);

module.exports = router;