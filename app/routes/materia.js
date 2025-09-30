const express = require('express');
const controller = require('../controllers/materia');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'materia';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/ActividadesPenyCum`, controller.getActPenyCum);

module.exports = router;