const express = require('express');
const controller = require('../controllers/rol');
const router = express.Router();

const path = 'rol';

router.post(`/${path}`, controller.crearRol);

module.exports = router;

