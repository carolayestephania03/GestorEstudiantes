const express = require('express');
const controller = require('../controllers/grado');
const router = express.Router();

const path = 'grado';

router.get(`/${path}`, controller.getGrados);
router.get(`/${path}/:id_grado`, controller.getGradoById);
router.post(`/${path}`, controller.createGrado);
router.put(`/${path}/:id_grado`, controller.updateGrado);
router.delete(`/${path}/:id_grado`, controller.deleteGrado);

module.exports = router;

