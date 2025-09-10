const express = require('express');
const controller = require('../controllers/Alumno');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'alumno';

router.get(`/${path}`, controller.getData);

module.exports = router;