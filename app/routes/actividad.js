const express = require('express');
const controller = require('../controllers/Actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'actividad';

router.get(`/${path}`, controller.getData);

module.exports = router;