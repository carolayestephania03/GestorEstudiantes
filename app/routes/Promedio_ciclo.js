const express = require('express');
const controller = require('../controllers/Promedio_ciclo');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'promedioCiclo';

router.get(`/${path}`, controller.getData);

module.exports = router;