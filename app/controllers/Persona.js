/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Persona = require('../models/Persona');
const sequelize = require('../../config/dbconfig');

exports.buscarMaestros = [
  // -------- obligatorios --------
  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  body('grado_id')
    .exists().withMessage('grado_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .exists().withMessage('seccion_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  // -------- opcionales (maestro) --------
  body('codigo_empleado')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_empleado debe ser entero > 0'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  body('escalafon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  body('nombre_maestro')
    .optional({ nullable: true })
    .isString().withMessage('nombre_maestro debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('nombre_maestro máximo 120 caracteres'),

  body('dpi_maestro')
    .optional({ nullable: true })
    .isString().withMessage('dpi_maestro debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('dpi_maestro máximo 20 caracteres'),

  // -------- opcionales (donde imparte) --------
  body('grado_imparte_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_imparte_id debe ser entero > 0'),

  body('seccion_imparte_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_imparte_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const anio = Number(req.body.anio);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      // opcionales: mandar NULL si vienen vacíos
      const codigo_empleado =
        req.body.codigo_empleado === '' || req.body.codigo_empleado == null
          ? null
          : Number(req.body.codigo_empleado);

      const renglon_id =
        req.body.renglon_id === '' || req.body.renglon_id == null
          ? null
          : Number(req.body.renglon_id);

      const escalafon_id =
        req.body.escalafon_id === '' || req.body.escalafon_id == null
          ? null
          : Number(req.body.escalafon_id);

      const nombre_maestro = (req.body.nombre_maestro ?? '').toString().trim();
      const dpi_maestro = (req.body.dpi_maestro ?? '').toString().trim();

      const grado_imparte_id =
        req.body.grado_imparte_id === '' || req.body.grado_imparte_id == null
          ? null
          : Number(req.body.grado_imparte_id);

      const seccion_imparte_id =
        req.body.seccion_imparte_id === '' || req.body.seccion_imparte_id == null
          ? null
          : Number(req.body.seccion_imparte_id);

      const raw = await sequelize.query(
        'CALL sp_buscar_maestros(:anio,:grado,:seccion,:codEmp,:renglon,:escalafon,:nom,:dpi,:gradoImp,:seccionImp);',
        {
          replacements: {
            anio,
            grado: grado_id,
            seccion: seccion_id,

            codEmp: codigo_empleado,
            renglon: renglon_id,
            escalafon: escalafon_id,
            nom: nombre_maestro.length ? nombre_maestro : null,
            dpi: dpi_maestro.length ? dpi_maestro : null,
            gradoImp: grado_imparte_id,
            seccionImp: seccion_imparte_id
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      // Búsqueda: 0 filas no es error
      return res.status(200).json({ data: rows || [] });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      // SIGNAL del SP -> 400 / 404
      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];
