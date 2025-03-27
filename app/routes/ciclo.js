const express = require('express');
const controller = require('../controllers/ciclo');
const router = express.Router();

const path = 'ciclo';

router.get(`/${path}`, controller.getCiclos);
router.get(`/${path}/:id_ciclo`, controller.getCicloById);
router.post(`/${path}`, controller.createCiclo);
router.put(`/${path}/:id_ciclo`, controller.updateCiclo);
router.delete(`/${path}/:id_ciclo`, controller.deleteCiclo);

module.exports = router;

