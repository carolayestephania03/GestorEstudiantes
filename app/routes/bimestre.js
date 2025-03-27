const express = require('express');
const controller = require('../controllers/bimestre');
const router = express.Router();

const path = 'bimestre';

router.get(`/${path}`, controller.getBimestres);
router.get(`/${path}/:id_bimestre`, controller.getBimestreById);
router.post(`/${path}`, controller.createBimestre);
router.put(`/${path}/:id_bimestre`, controller.updateBimestre);
router.delete(`/${path}/:id_bimestre`, controller.deleteBimestre);

module.exports = router;
