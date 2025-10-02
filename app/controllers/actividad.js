/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const Actividad = require('../models/actividad');

/**Operación GET hacia la DB*/
exports.getActividadesData = [
  // ✅ Validación por BODY (no URL)
  body('grado_id').exists().withMessage('grado_id requerido').bail().isInt({ gt: 0 }),
  body('seccion_id').exists().withMessage('seccion_id requerido').bail().isInt({ gt: 0 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      const execSP = async (tipo) => {
        const result = await sequelize.query(
          `CALL sp_rep_actividades_detalle_by_id(:g, :s, :t);`,
          { replacements: { g: grado_id, s: seccion_id, t: tipo } }
        );
        // Normaliza posibles shapes del driver
        if (!result) return [];
        if (Array.isArray(result) && result.length && typeof result[0] === 'object') return result;
        if (Array.isArray(result) && result.length && Array.isArray(result[0])) return result[0];
        if (Array.isArray(result) && !result.length) return [];
        if (typeof result === 'object') return [result];
        return [];
      };

      const [t1, t2, t3] = await Promise.all([
        execSP(1), // Procedimental
        execSP(2), // Actitudinal
        execSP(3)  // Declarativo
      ]);

      return res.status(200).json({
        data: {
          tipo_actividad_1: t1,
          tipo_actividad_2: t2,
          tipo_actividad_3: t3
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.crearActividad = [
  // ====== VALIDACIONES (TODOS los datos que pide el SP) ======
  body('grado_id')
    .notEmpty().withMessage('grado_id es requerido')
    .toInt().isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .notEmpty().withMessage('seccion_id es requerido')
    .toInt().isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  body('materia_id')
    .notEmpty().withMessage('materia_id es requerido')
    .toInt().isInt({ gt: 0 }).withMessage('materia_id debe ser entero > 0'),

  body('tipo_actividad_id')
    .notEmpty().withMessage('tipo_actividad_id es requerido')
    .toInt().isInt({ gt: 0 }).withMessage('tipo_actividad_id debe ser entero > 0'),

  body('nombre_actividad')
    .trim()
    .notEmpty().withMessage('nombre_actividad es requerido')
    .isLength({ max: 255 }).withMessage('nombre_actividad: máximo 255 caracteres')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('fecha_entrega')
    .notEmpty().withMessage('fecha_entrega es requerida')
    .isISO8601().withMessage('fecha_entrega debe ser una fecha válida (ISO 8601)')
    // MySQL DATETIME acepta "YYYY-MM-DD HH:mm:ss"; si te envían solo fecha, puedes normalizar a fin de día:
    .customSanitizer(v => v.length === 10 ? `${v} 23:59:00` : v),

  body('puntaje_maximo')
    .notEmpty().withMessage('puntaje_maximo es requerido')
    .isFloat({ gt: 0, lt: 100000 }).withMessage('puntaje_maximo debe ser > 0')
    .toFloat(),

  body('estado_actividad_id')
    .notEmpty().withMessage('estado_actividad_id es requerido')
    .toInt().isInt({ gt: 0 }).withMessage('estado_actividad_id debe ser entero > 0'),

  body('estado')
    .notEmpty().withMessage('estado es requerido')
    .toInt().isInt({ min: 0, max: 1 }).withMessage('estado debe ser 0 o 1'),

  body('crear_para_alumnos')
    .notEmpty().withMessage('crear_para_alumnos es requerido')
    .toInt().isInt({ min: 0, max: 1 }).withMessage('crear_para_alumnos debe ser 0 o 1'),

  // ====== HANDLER ======
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        grado_id,
        seccion_id,
        materia_id,
        tipo_actividad_id,
        nombre_actividad,
        descripcion,
        fecha_entrega,
        puntaje_maximo,
        estado_actividad_id,
        estado,
        crear_para_alumnos
      } = req.body;

      const sql = `
        CALL sp_actividad_crear_por_clase(
          :p_grado_id,
          :p_seccion_id,
          :p_materia_id,
          :p_tipo_actividad_id,
          :p_nombre_actividad,
          :p_descripcion,
          :p_fecha_entrega,
          :p_puntaje_maximo,
          :p_estado_actividad_id,
          :p_estado,
          :p_crear_para_alumnos
        );
      `;

      const result = await sequelize.query(sql, {
        replacements: {
          p_grado_id: Number(grado_id),
          p_seccion_id: Number(seccion_id),
          p_materia_id: Number(materia_id),
          p_tipo_actividad_id: Number(tipo_actividad_id),
          p_nombre_actividad: nombre_actividad.trim(),
          p_descripcion: descripcion ?? null,
          p_fecha_entrega: fecha_entrega,     // ya sanitizada arriba
          p_puntaje_maximo: Number(puntaje_maximo),
          p_estado_actividad_id: Number(estado_actividad_id),
          p_estado: Number(estado),
          p_crear_para_alumnos: Number(crear_para_alumnos)
        }
      });

      // Normaliza la respuesta de CALL para quedarte con la fila {actividad_id, alumnos_asignados}
      let data = null;
      if (Array.isArray(result)) {
        // En muchos drivers, CALL devuelve [rows] o [rows, ...]
        const rows = Array.isArray(result[0]) ? result[0] : result;
        data = Array.isArray(rows) && rows.length ? rows[0] : null;
      }

      return res.status(201).json({
        message: 'Actividad creada correctamente',
        data // { actividad_id, alumnos_asignados }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.getActividadesData = [
  body('grado_id').exists().withMessage('grado_id requerido').bail().isInt({ gt: 0 }),
  body('seccion_id').exists().withMessage('seccion_id requerido').bail().isInt({ gt: 0 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      const execSP = async (tipo) => {
        const result = await sequelize.query(
          `CALL sp_rep_actividades_detalle_by_id(:g, :s, :t);`,
          { replacements: { g: grado_id, s: seccion_id, t: tipo } }
        );
        // Normaliza posibles shapes del driver para CALL
        if (!result) return [];
        if (Array.isArray(result) && result.length && typeof result[0] === 'object') return result;
        if (Array.isArray(result) && result.length && Array.isArray(result[0])) return result[0];
        if (Array.isArray(result) && !result.length) return [];
        if (typeof result === 'object') return [result];
        return [];
      };

      const [t1, t2, t3] = await Promise.all([
        execSP(1), // Procedimental
        execSP(2), // Actitudinal
        execSP(3)  // Declarativo
      ]);

      return res.status(200).json({
        data: {
          tipo_actividad_1: t1,
          tipo_actividad_2: t2,
          tipo_actividad_3: t3
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.getActividadDetalle = [
  body('actividad_id')
    .exists().withMessage('actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('actividad_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const actividad_id = Number(req.body.actividad_id);

      // Ejecuta el SP (devuelve UN result set con 1 fila)
      const raw = await sequelize.query(
        'CALL sp_rep_actividad_detalle_by_id(:id);',
        { replacements: { id: actividad_id } }
      );

      // Normalización robusta de la respuesta del CALL:
      // Puede venir como [ [row] ] o [row] o row.
      let row = null;
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) {
          row = raw[0][0] ?? null;    // forma [[row]]
        } else if (raw.length === 1 && typeof raw[0] === 'object') {
          row = raw[0];               // forma [row]
        } else if (raw.length > 1 && typeof raw[0] === 'object') {
          row = raw[0];               // primera fila por si acaso
        }
      } else if (raw && typeof raw === 'object') {
        row = raw;                     // forma row
      }

      if (!row) {
        // Si el SP hizo SIGNAL previo, podrías no llegar aquí;
        // este 404 cubre el caso de respuesta vacía.
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }

      return res.status(200).json({
        data: row
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';
      if (/actividad no existe/i.test(msg)) {
        return res.status(404).json({ error: 'Actividad no encontrada' });
      }
      if (/actividad_id inválido/i.test(msg)) {
        return res.status(400).json({ error: 'actividad_id inválido' });
      }
      return res.status(500).json({ error: msg });
    }
  }
];