const express = require('express');
const controller = require('../controllers/Grado');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'grado';

router.get(`/${path}`, controller.getData);

module.exports = router;