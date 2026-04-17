const express = require('express');
const controller = require('../controllers/Escalafon');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'escalafon';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/CrearEscalafon`, controller.postData);

router.put(`/${path}/ActualizarEscalafon`, controller.putData);

router.delete(`/${path}/EliminarEscalafon`, controller.deleteData);

module.exports = router;