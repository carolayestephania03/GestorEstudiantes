const express = require('express');
const controller = require('../controllers/bitacora');
const router = express.Router();

const path = 'bitacora';

router.get(`/${path}`, controller.getBitacoras);
router.get(`/${path}/:id_bitacora`, controller.getBitacoraById);
router.post(`/${path}`, controller.createBitacora);
router.put(`/${path}/:id_bitacora`, controller.updateBitacora);
router.delete(`/${path}/:id_bitacora`, controller.deleteBitacora);

module.exports = router;
