const express = require('express');
const controller = require('../controllers/promedio_ambito');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'promedioAmbito';

router.get(`/${path}`, controller.getData);

module.exports = router;