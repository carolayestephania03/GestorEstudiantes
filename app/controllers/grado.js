/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Grado = require('../models/Grado');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Grado.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerMateriasPorGradoSimple = [
  body('grado_id')
    .exists().withMessage('grado_id requerido')
    .bail()
    .toInt()
    .isInt({ min: 0 }).withMessage('grado_id debe ser entero >= 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const grado_id = Number(req.body.grado_id);

      const raw = await sequelize.query(
        `CALL sp_materias_por_grado_simple(:p_grado_id);`,
        {
          replacements: {
            p_grado_id: grado_id
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      const gradosMap = new Map();

      for (const row of rows || []) {
        const gradoId = Number(row.grado_id);

        if (!gradosMap.has(gradoId)) {
          gradosMap.set(gradoId, {
            grado_id: gradoId,
            grado_des: row.grado_des,
            materias: []
          });
        }

        gradosMap.get(gradoId).materias.push({
          materia_id: Number(row.materia_id),
          nombre_materia: row.nombre_materia
        });
      }

      const data = Array.from(gradosMap.values());

      return res.status(200).json({
        message: 'Materias obtenidas correctamente',
        data
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/grado_id inválido/i.test(msg) || /grado_id invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }

      if (/el grado no existe o está inactivo/i.test(msg) || /el grado no existe o esta inactivo/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarMateriasActivasPorGrado = [
  // -------- obligatorios --------
  body('grado_id')
    .exists().withMessage('grado_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('materias')
    .exists().withMessage('materias requerido')
    .bail()
    .isArray().withMessage('materias debe ser un arreglo'),

  body('materias.*')
    .optional()
    .toInt()
    .isInt({ gt: 0 }).withMessage('Cada materia_id debe ser entero > 0'),

  // -------- validación cruzada --------
  body().custom(({ materias }) => {
    if (!Array.isArray(materias)) {
      throw new Error('materias debe ser un arreglo');
    }

    const ids = materias.map(m => Number(m));
    const idsUnicos = new Set(ids);

    if (ids.length !== idsUnicos.size) {
      throw new Error('No se permite repetir materia_id en materias');
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const grado_id = Number(req.body.grado_id);
      const materias = req.body.materias.map(m => Number(m));
      const materias_json = JSON.stringify(materias);

      const raw = await sequelize.query(
        `CALL sp_materia_grado_actualizar_activas(
          :p_grado_id,
          :p_materias_json
        );`,
        {
          replacements: {
            p_grado_id: grado_id,
            p_materias_json: materias_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Materias del grado actualizadas correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /grado_id inválido/i.test(msg) ||
        /grado_id invalido/i.test(msg) ||
        /p_materias_json no es un json válido/i.test(msg) ||
        /p_materias_json no es un json valido/i.test(msg) ||
        /p_materias_json inválido/i.test(msg) ||
        /p_materias_json invalido/i.test(msg) ||
        /no se permite repetir materia_id/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /el grado no existe o está inactivo/i.test(msg) ||
        /el grado no existe o esta inactivo/i.test(msg) ||
        /una o más materias son inválidas o están inactivas/i.test(msg) ||
        /una o mas materias son invalidas o estan inactivas/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];