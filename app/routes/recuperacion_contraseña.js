const express = require('express');
const controller = require('../controllers/recuperacion_contraseña');
const router = express.Router();

const path = 'recuperacion_contraseña';

router.post(`/${path}`, controller.recuperarContraseña);

module.exports = router;
