const express = require('express');
const controller = require('../controllers/Renglon');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'renglon';

router.get(`/${path}`, controller.getData);

module.exports = router;