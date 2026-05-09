const express = require('express');
const controller = require('../controllers/ciclo');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'ciclo';

router.get(`/${path}`, controller.getData);

module.exports = router;