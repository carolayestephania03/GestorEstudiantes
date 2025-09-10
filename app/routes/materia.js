const express = require('express');
const controller = require('../controllers/Materia');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'materia';

router.get(`/${path}`, controller.getData);

module.exports = router;