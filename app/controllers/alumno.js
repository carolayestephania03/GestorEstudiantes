/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const Alumno = require('../models/Alumno');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Alumno.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.buscarAlumnos = [
  // ========= VALIDACIONES (todos opcionales) =========
  body('codigo_alumno')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 }).withMessage('codigo_alumno: máximo 20 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('nombre')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 }).withMessage('nombre: máximo 150 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('grado_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  body('dpi')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 }).withMessage('dpi: máximo 20 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  // ========= HANDLER =========
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        codigo_alumno = null,
        nombre = null,
        grado_id = null,
        seccion_id = null,
        dpi = null
      } = req.body || {};

      const sql = `
        CALL sp_buscar_alumnos(
          :p_codigo_alumno,
          :p_nombre,
          :p_grado_id,
          :p_seccion_id,
          :p_dpi
        );
      `;

      const result = await sequelize.query(sql, {
        replacements: {
          p_codigo_alumno: codigo_alumno && String(codigo_alumno).trim().length ? String(codigo_alumno).trim() : null,
          p_nombre: nombre && String(nombre).trim().length ? String(nombre).trim() : null,
          p_grado_id: grado_id ? Number(grado_id) : null,
          p_seccion_id: seccion_id ? Number(seccion_id) : null,
          p_dpi: dpi && String(dpi).trim().length ? String(dpi).trim() : null
        }
      });

      // Normaliza posibles “shapes” del driver para CALL
      let rows = [];
      if (Array.isArray(result)) {
        if (Array.isArray(result[0])) rows = result[0];           // [[rows]]
        else if (result.length && typeof result[0] === 'object') rows = result; // [rows]
      } else if (result && typeof result === 'object') {
        rows = [result]; // row único
      }

      return res.status(200).json({ data: rows });
    } catch (error) {
      const msg = error?.message || 'Error interno';
      if (/Ciclo_Escolar activo/i.test(msg)) {
        // Mensaje lanzado por el SP cuando no hay ciclo activo
        return res.status(409).json({ error: msg });
      }
      return res.status(500).json({ error: msg });
    }
  }
];  