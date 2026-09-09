const express = require('express');
const controller = require('../controllers/seccion');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'seccion';

router.get(`/${path}`, controller.getData);

module.exports = router;