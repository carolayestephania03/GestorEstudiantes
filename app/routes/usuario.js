const express = require('express');
const controller = require('../controllers/Usuario');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'usuario';

router.get(`/${path}`, controller.getData);

module.exports = router;