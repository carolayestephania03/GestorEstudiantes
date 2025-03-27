const express = require('express');
const controller = require('../controllers/usuario');
const router = express.Router();

const path = 'usuario';

router.get(`/${path}`, controller.obtenerUsuarios);
router.get(`/${path}/:id`, controller.obtenerUsuario);
router.post(`/${path}`, controller.crearUsuario);
router.put(`/${path}/:id`, controller.actualizarUsuario);
router.delete(`/${path}/:id`, controller.eliminarUsuario);

module.exports = router;

