const express = require('express');
const controller = require('../controllers/Usuario');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'usuario';

router.get(`/${path}`, controller.getData);

router.post(`/${path}/Crear`, controller.postData);

router.post(`/${path}/Login`, controller.login);

router.put(`/${path}/Actualizar`, controller.putData);

module.exports = router;