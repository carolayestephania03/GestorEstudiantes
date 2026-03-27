/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const Calificacion = require('../models/Calificacion');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Calificacion.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAlumnMejProm = [
    body("anio")
        .trim()
        .isInt()
        .withMessage("El tipo de dato de eje no es correcto")
        .customSanitizer((value) => (value == 0 ? null : value)), // Reemplaza 0 por null

    body("grado")
        .optional()
        .isInt()
        .withMessage("El tipo de dato de eje no es correcto")
        .customSanitizer((value) => (value == 0 ? null : value)), // Reemplaza 0 por null

    body("seccion")
        .optional()
        .isInt()
        .withMessage("El tipo de dato de eje no es correcto")
        .customSanitizer((value) => (value == 0 ? null : value)), // Reemplaza 0 por nul
    // Controlador
    async (req, res) => {
        // Manejo de errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { anio, grado, seccion } =
            req.body;

        try {
            // Ejecutar el procedimiento almacenado
            const data = await sequelize.query(
                `CALL sp_rep_rendimiento_alumnos_clase(:anio, :grado, :seccion);`,
                {
                    replacements: {
                        anio,
                        grado,
                        seccion,
                    },
                }
            );

            // Verificar si data es un array
            if (!Array.isArray(data)) {
                return res
                    .status(500)
                    .json({ error: "Unexpected data format from stored procedure" });
            }

            // Enviar los resultados al cliente
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
];

exports.repNotasMateriasBimestre = [
  // -------- obligatorios --------
  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido'),

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

  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe ser 1, 2, 3 o 4'),

  // -------- opcional: filtro de alumnos --------
  body('alumnos')
    .optional({ nullable: true })
    .isArray().withMessage('alumnos debe ser un arreglo'),

  body('alumnos.*')
    .optional()
    .toInt()
    .isInt({ gt: 0 }).withMessage('Cada alumno_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const anio = Number(req.body.anio);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);

      // NULL o [] = todos
      const alumnos =
        Array.isArray(req.body.alumnos)
          ? [...new Set(req.body.alumnos.map(x => Number(x)).filter(x => Number.isInteger(x) && x > 0))]
          : [];

      const alumnos_json = alumnos.length > 0 ? JSON.stringify(alumnos) : null;

      const raw = await sequelize.query(
        `CALL sp_rep_notas_materias_bimestre(
          :p_anio,
          :p_grado_id,
          :p_seccion_id,
          :p_ciclo_id,
          :p_alumnos_json
        );`,
        {
          replacements: {
            p_anio: anio,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_ciclo_id: ciclo_id,
            p_alumnos_json: alumnos_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Reporte de notas obtenido correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /inexistente/i.test(msg) ||
        /inactiva/i.test(msg) ||
        /inactivo/i.test(msg) ||
        /no existe/i.test(msg) ||
        /no hay materias asignadas/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];