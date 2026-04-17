/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Materia = require('../models/Materia');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Materia.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActPenyCum = [
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
                `CALL sp_rep_actividades_materia_estado(:anio, :grado, :seccion);`,
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

exports.crearMateria = [
  // -------- básicos --------
  body('nombre_materia')
    .exists().withMessage('nombre_materia requerido')
    .bail()
    .isString().withMessage('nombre_materia debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_materia requerido')
    .isLength({ max: 100 }).withMessage('nombre_materia máximo 100 caracteres'),

  body('descripcion_materia')
    .exists().withMessage('descripcion_materia requerida')
    .bail()
    .isString().withMessage('descripcion_materia debe ser texto')
    .trim()
    .notEmpty().withMessage('descripcion_materia requerida'),

  // -------- grados --------
  body('grados')
    .exists().withMessage('grados requerido')
    .bail()
    .isArray({ min: 1 }).withMessage('grados debe ser un arreglo con al menos un elemento'),

  body('grados.*')
    .exists().withMessage('grado_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('Cada grado_id debe ser entero > 0'),

  // -------- validaciones cruzadas --------
  body().custom(({ grados }) => {
    if (!Array.isArray(grados) || grados.length === 0) {
      throw new Error('Debe enviar al menos un grado en grados');
    }

    const gradosUnicos = new Set(grados.map(g => Number(g)));
    if (gradosUnicos.size !== grados.length) {
      throw new Error('No se permite repetir grado_id en grados');
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const nombre_materia = req.body.nombre_materia.toString().trim();
      const descripcion_materia = req.body.descripcion_materia.toString().trim();

      const grados = [...new Set(req.body.grados.map(g => Number(g)))];

      // Tipos fijos por defecto
      const tipos = [
        { tipo_actividad_id: 1, ponderacion: 40.00 },
        { tipo_actividad_id: 2, ponderacion: 40.00 }
      ];

      const grados_json = JSON.stringify(grados);
      const tipos_json = JSON.stringify(tipos);

      const raw = await sequelize.query(
        `CALL sp_materia_crear(
          :p_nombre_materia,
          :p_descripcion_materia,
          :p_estado,
          :p_grados_json,
          :p_tipos_json
        );`,
        {
          replacements: {
            p_nombre_materia: nombre_materia,
            p_descripcion_materia: descripcion_materia,
            p_estado: 1,
            p_grados_json: grados_json,
            p_tipos_json: tipos_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(201).json({
        message: 'Materia creada correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /requerid/i.test(msg) ||
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /debe enviar al menos un grado/i.test(msg) ||
        /no se permite repetir grado_id/i.test(msg) ||
        /la suma de ponderaciones no puede ser mayor a 100/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /uno o más grados son inválidos/i.test(msg) ||
        /uno o mas grados son invalidos/i.test(msg) ||
        /los tipos de actividad 1 y 2 deben existir/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (/la materia ya existe/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarMateria = [
  // -------- básicos --------
  body('materia_id')
    .exists().withMessage('materia_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('materia_id debe ser entero > 0'),

  body('nombre_materia')
    .exists().withMessage('nombre_materia requerido')
    .bail()
    .isString().withMessage('nombre_materia debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_materia requerido')
    .isLength({ max: 100 }).withMessage('nombre_materia máximo 100 caracteres'),

  body('descripcion_materia')
    .optional({ nullable: true })
    .isString().withMessage('descripcion_materia debe ser texto')
    .trim(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const materia_id = Number(req.body.materia_id);
      const nombre_materia = req.body.nombre_materia.toString().trim();
      const descripcion_materia =
        req.body.descripcion_materia == null
          ? ''
          : req.body.descripcion_materia.toString().trim();
      const estado = Number(req.body.estado);

      const raw = await sequelize.query(
        `CALL sp_materia_actualizar(
          :p_materia_id,
          :p_nombre_materia,
          :p_descripcion_materia,
          :p_estado
        );`,
        {
          replacements: {
            p_materia_id: materia_id,
            p_nombre_materia: nombre_materia,
            p_descripcion_materia: descripcion_materia,
            p_estado: 1
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Materia actualizada correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /materia_id inválido/i.test(msg) ||
        /materia_id invalido/i.test(msg) ||
        /nombre_materia requerido/i.test(msg) ||
        /estado inválido/i.test(msg) ||
        /estado invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (/la materia no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      if (/ya existe otra materia con ese nombre/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];