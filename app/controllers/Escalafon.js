/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Escalafon = require('../models/Escalafon');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
  try {
    const data = await Escalafon.findAll({
      where: {
        estado_escalafon: 1
      }
    });

    return res.status(200).json({
      message: 'Escalafones activos obtenidos correctamente',
      data: data || []
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error interno del servidor'
    });
  }
};


/* =========================================================
   INSERT - CREAR ESCALAFON
========================================================= */
exports.postData = [
  body('descripcion')
    .trim()
    .notEmpty().withMessage('nombre_escalafon es requerido')
    .isLength({ max: 100 }).withMessage('nombre_escalafon máximo 100 caracteres')
    .custom(v => {
      if (v.includes(';') || v.includes('--')) {
        throw new Error('Caracteres inválidos');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const nombre_escalafon = req.body.descripcion.trim();

      const existe = await Escalafon.findOne({
        where: { descripcion: nombre_escalafon }
      });

      if (existe) {
        return res.status(409).json({
          error: 'El escalafón ya existe'
        });
      }

      const data = await Escalafon.create({
        descripcion: nombre_escalafon,
        estado_escalafon: 1
      });

      return res.status(201).json({
        message: 'Escalafón creado correctamente',
        data
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }
];

/* =========================================================
   UPDATE - EDITAR NOMBRE DEL ESCALAFON
========================================================= */
exports.putData = [
  body('escalafon_id')
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('nombre_escalafon es requerido')
    .isLength({ max: 100 }).withMessage('nombre_escalafon máximo 100 caracteres')
    .custom(v => {
      if (v.includes(';') || v.includes('--')) {
        throw new Error('Caracteres inválidos');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const escalafon_id = Number(req.body.escalafon_id);
      const nombre_escalafon = req.body.descripcion.trim();

      const escalafon = await Escalafon.findOne({
        where: { escalafon_id }
      });

      if (!escalafon) {
        return res.status(404).json({
          error: 'Escalafón no encontrado'
        });
      }

      const duplicado = await Escalafon.findOne({
        where: { descripcion: nombre_escalafon }
      });

      if (duplicado && Number(duplicado.escalafon_id) !== escalafon_id) {
        return res.status(409).json({
          error: 'Ya existe otro escalafón con ese nombre'
        });
      }

      await escalafon.update({
        descripcion: nombre_escalafon
      });

      return res.status(200).json({
        message: 'Escalafón actualizado correctamente',
        data: escalafon
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }
];

/* =========================================================
   DELETE LOGICO - DESACTIVAR ESCALAFON
========================================================= */
exports.deleteData = [
  body('escalafon_id')
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const escalafon_id = Number(req.body.escalafon_id);

      const escalafon = await Escalafon.findOne({
        where: { escalafon_id }
      });

      if (!escalafon) {
        return res.status(404).json({
          error: 'Escalafón no encontrado'
        });
      }

      await escalafon.update({
        estado_escalafon: 0
      });

      return res.status(200).json({
        message: 'Escalafón desactivado correctamente',
        data: escalafon
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }
];