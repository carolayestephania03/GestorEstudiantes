/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Renglon = require('../models/Renglon');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
  try {
    const data = await Renglon.findAll({
      where: {
        estado_renglon: 1
      }
    });

    return res.status(200).json({
      message: 'Renglones activos obtenidos correctamente',
      data: data || []
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error interno del servidor'
    });
  }
};


/* =========================================================
   INSERT - CREAR RENGLON
========================================================= */
exports.postData = [
  body('descripcion')
    .trim()
    .notEmpty().withMessage('nombre_renglon es requerido')
    .isLength({ max: 100 }).withMessage('nombre_renglon máximo 100 caracteres')
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
      const nombre_renglon = req.body.descripcion.trim();

      const existe = await Renglon.findOne({
        where: { descripcion: nombre_renglon }
      });

      if (existe) {
        return res.status(409).json({
          error: 'El renglon ya existe'
        });
      }

      const data = await Renglon.create({
        descripcion: nombre_renglon,
        estado_renglon: 1
      });

      return res.status(201).json({
        message: 'Renglón creado correctamente',
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
  body('renglon_id')
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('nombre_renglon es requerido')
    .isLength({ max: 100 }).withMessage('nombre_renglon máximo 100 caracteres')
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
      const renglon_id = Number(req.body.renglon_id);
      const nombre_renglon = req.body.descripcion.trim();

      const renglon = await Renglon.findOne({
        where: { renglon_id }
      });

      if (!renglon) {
        return res.status(404).json({
          error: 'Renglón no encontrado'
        });
      }

      const duplicado = await Renglon.findOne({
        where: { descripcion: nombre_renglon }
      });

      if (duplicado && Number(duplicado.renglon_id) !== renglon_id) {
        return res.status(409).json({
          error: 'Ya existe otro renglón con ese nombre'
        });
      }

      await renglon.update({
        descripcion: nombre_renglon
      });

      return res.status(200).json({
        message: 'Renglón actualizado correctamente',
        data: renglon
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
  body('renglon_id')
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const renglon_id = Number(req.body.renglon_id);

      const renglon = await Renglon.findOne({
        where: { renglon_id }
      });

      if (!renglon) {
        return res.status(404).json({
          error: 'Renglón no encontrado'
        });
      }

      await renglon.update({
        estado_renglon: 0
      });

      return res.status(200).json({
        message: 'Renglón desactivado correctamente',
        data: renglon
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Error interno del servidor'
      });
    }
  }
];