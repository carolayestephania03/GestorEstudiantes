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

exports.buscarAlumnosConMaestros = [
  // --------- obligatorios ----------
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

  // --------- opcionales ----------
  body('codigo_alumno')
    .optional({ nullable: true })
    .isString().withMessage('codigo_alumno debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('codigo_alumno máximo 20 caracteres'),

  body('nombre_alumno')
    .optional({ nullable: true })
    .isString().withMessage('nombre_alumno debe ser texto')
    .trim()
    .isLength({ max: 100 }).withMessage('nombre_alumno máximo 100 caracteres'),

  body('nombre_maestro')
    .optional({ nullable: true })
    .isString().withMessage('nombre_maestro debe ser texto')
    .trim()
    .isLength({ max: 100 }).withMessage('nombre_maestro máximo 100 caracteres'),

  body('dpi_alumno')
    .optional({ nullable: true })
    .isString().withMessage('dpi_alumno debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('dpi_alumno máximo 20 caracteres'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const anio = Number(req.body.anio);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      // Importante: si vienen vacíos, mandarlos como NULL para que el SP no filtre.
      const codigo_alumno = (req.body.codigo_alumno ?? '').toString().trim();
      const nombre_alumno = (req.body.nombre_alumno ?? '').toString().trim();
      const nombre_maestro = (req.body.nombre_maestro ?? '').toString().trim();
      const dpi_alumno = (req.body.dpi_alumno ?? '').toString().trim();

      const raw = await sequelize.query(
        'CALL sp_buscar_alumnos_con_maestros(:anio,:grado,:seccion,:codigo,:nombreAl,:nombreM,:dpi);',
        {
          replacements: {
            anio,
            grado: grado_id,
            seccion: seccion_id,
            codigo: codigo_alumno.length ? codigo_alumno : null,
            nombreAl: nombre_alumno.length ? nombre_alumno : null,
            nombreM: nombre_maestro.length ? nombre_maestro : null,
            dpi: dpi_alumno.length ? dpi_alumno : null
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      // Puede devolver 0 resultados sin ser error (búsqueda sin match)
      return res.status(200).json({ data: rows || [] });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      // Mapear SIGNAL del SP -> 400/404 “limpio”
      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        // el SP usa SIGNAL 45000 también para “no existe ciclo/grado-sección”
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];
