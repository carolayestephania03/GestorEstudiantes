const express = require('express');
const controller = require('../controllers/Escalafon');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'escalafon';

router.get(`/${path}`, controller.getData);

module.exports = router;