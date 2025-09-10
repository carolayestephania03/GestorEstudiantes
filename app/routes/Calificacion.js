const express = require('express');
const controller = require('../controllers/Calificacion');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'calificacion';

router.get(`/${path}`, controller.getData);

module.exports = router;