const express = require('express');
const controller = require('../controllers/Encargado');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'encargado';

router.get(`/${path}`, controller.getData);

module.exports = router;