const express = require('express');
const controller = require('../controllers/materia');
const router = express.Router();

const path = 'materia';

router.get(`/${path}`, controller.getMaterias);
router.get(`/${path}/:id_materia`, controller.getMateriaById);
router.post(`/${path}`, controller.createMateria);
router.put(`/${path}/:id_materia`, controller.updateMateria);
router.delete(`/${path}/:id_materia`, controller.deleteMateria);

module.exports = router;
