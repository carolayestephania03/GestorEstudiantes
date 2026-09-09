const express = require('express');
const controller = require('../controllers/Renglon');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'renglon';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/CrearRenglon`, controller.postData);

router.put(`/${path}/ActualizarRenglon`, controller.putData);

router.delete(`/${path}/EliminarRenglon`, controller.deleteData);

module.exports = router;