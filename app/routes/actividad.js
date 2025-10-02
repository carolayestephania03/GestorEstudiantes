const express = require('express');
const controller = require('../controllers/actividad');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'actividad';

router.get(`/${path}`, controller.getActividadesData);

module.exports = router;