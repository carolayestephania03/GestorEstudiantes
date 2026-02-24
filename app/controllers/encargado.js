/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Encargado = require('../models/Encargado');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Encargado.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.buscarEncargadosConAlumnos = [

  body('dpi_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('dpi_encargado máximo 20 caracteres'),

  body('nombre_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('nombre_encargado máximo 100 caracteres'),

  body('telefono_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('telefono_encargado máximo 20 caracteres'),

  body('codigo_alumno')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('codigo_alumno máximo 20 caracteres'),

  body('nombre_alumno')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('nombre_alumno máximo 100 caracteres'),

  body('grado_id')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {

      const {
        dpi_encargado = null,
        nombre_encargado = null,
        telefono_encargado = null,
        codigo_alumno = null,
        nombre_alumno = null,
        grado_id = null,
        seccion_id = null
      } = req.body;

      const raw = await sequelize.query(
        `CALL sp_buscar_encargados_alumnos(
          :dpi,
          :nombreEnc,
          :telefono,
          :codigoAl,
          :nombreAl,
          :grado,
          :seccion
        );`,
        {
          replacements: {
            dpi: dpi_encargado || null,
            nombreEnc: nombre_encargado || null,
            telefono: telefono_encargado || null,
            codigoAl: codigo_alumno || null,
            nombreAl: nombre_alumno || null,
            grado: grado_id || null,
            seccion: seccion_id || null
          }
        }
      );

      // Normalización del result set
      let rows = [];
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) rows = raw[0];
        else rows = raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          error: 'No se encontraron resultados con los filtros proporcionados'
        });
      }

      const encargadosMap = new Map();

      for (const r of rows) {

        if (!encargadosMap.has(r.encargado_id)) {
          encargadosMap.set(r.encargado_id, {
            encargado_id: r.encargado_id,
            nombre: r.nombre_encargado,
            apellido: r.apellido_encargado,
            dpi: r.dpi_encargado,
            telefono: r.telefono,
            correo: r.correo,
            residencia: r.residencia,
            alumnos: []
          });
        }

        const encargado = encargadosMap.get(r.encargado_id);

        encargado.alumnos.push({
          alumno_id: r.alumno_id,
          codigo_alumno: r.codigo_alumno,
          nombre: r.nombre_alumno,
          apellido: r.apellido_alumno,
          estado_alumno: r.estado_alumno,
          grado: r.grado_des,
          seccion: r.seccion_des
        });
      }

      const data = Array.from(encargadosMap.values());

      return res.status(200).json({ total_encargados: data.length, data });

    } catch (error) {

      const msg = error?.message || 'Error interno';

      if (/Error al ejecutar el procedimiento/i.test(msg)) {
        return res.status(500).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];
