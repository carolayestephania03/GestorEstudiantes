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

exports.guardarActualizarCalificacion = [
  // -------- obligatorios --------
  body('alumno_id')
    .exists().withMessage('alumno_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('alumno_id debe ser entero > 0'),

  body('actividades')
    .exists().withMessage('actividades requerido')
    .bail()
    .isArray({ min: 1 }).withMessage('actividades debe ser un arreglo con al menos un elemento'),

  body('actividades.*.actividad_id')
    .exists().withMessage('actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('actividad_id debe ser entero > 0'),

  body('actividades.*.puntaje_obtenido')
    .exists().withMessage('puntaje_obtenido requerido')
    .bail()
    .isFloat({ min: 0 }).withMessage('puntaje_obtenido debe ser mayor o igual a 0'),

  body('actividades.*.comentarios')
    .optional({ nullable: true })
    .isString().withMessage('comentarios debe ser texto')
    .trim(),

  // -------- validación cruzada --------
  body().custom(({ actividades }) => {
    if (!Array.isArray(actividades) || actividades.length === 0) {
      throw new Error('Debe enviar al menos una actividad en el JSON');
    }

    const ids = actividades.map(a => Number(a.actividad_id));
    const idsUnicos = new Set(ids);

    if (ids.length !== idsUnicos.size) {
      throw new Error('No se permite repetir actividad_id en actividades');
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const alumno_id = Number(req.body.alumno_id);

      const actividades = req.body.actividades.map(act => ({
        actividad_id: Number(act.actividad_id),
        puntaje_obtenido: Number(act.puntaje_obtenido),
        comentarios:
          act.comentarios == null || act.comentarios === ''
            ? null
            : act.comentarios.toString().trim()
      }));

      const actividades_json = JSON.stringify(actividades);

      const raw = await sequelize.query(
        `CALL sp_calificacion_guardar_actualizar(
          :p_alumno_id,
          :p_actividades_json
        );`,
        {
          replacements: {
            p_alumno_id: alumno_id,
            p_actividades_json: actividades_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Calificaciones guardadas correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /debe enviar al menos una actividad/i.test(msg) ||
        /no se permite repetir actividad_id/i.test(msg) ||
        /puntajes fuera de rango/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /el alumno no existe o está inactivo/i.test(msg) ||
        /el alumno no existe o esta inactivo/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /actividades inválidas/i.test(msg) ||
        /actividades invalidas/i.test(msg) ||
        /inactivas/i.test(msg) ||
        /no calificadas/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

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

exports.repNotasListaCotejo = [
  // -------- obligatorios --------
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
    .isInt({ gt: 0 }).withMessage('ciclo_id debe ser entero > 0'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const anio = Number(req.body.anio);

      const raw = await sequelize.query(
        `CALL sp_rep_notas_lista_cotejo(
          :p_grado_id,
          :p_seccion_id,
          :p_ciclo_id,
          :p_anio
        );`,
        {
          replacements: {
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_ciclo_id: ciclo_id,
            p_anio: anio
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      // =========================================================
      // AGRUPAR: MATERIA -> TAREAS -> ALUMNOS/NOTAS
      // =========================================================
      const materiasMap = new Map();

      for (const row of rows || []) {
        const materiaKey = `${row.nombre_materia}||${row.tipo_actividad_id}||${row.tipo_tarea}`;
        const tareaKey = String(row.actividad_id);

        if (!materiasMap.has(materiaKey)) {
          materiasMap.set(materiaKey, {
            tipo_actividad_id: row.tipo_actividad_id,
            tipo_tarea: row.tipo_tarea,
            nombre_materia: row.nombre_materia,
            tareas: []
          });
        }

        const materiaObj = materiasMap.get(materiaKey);

        let tareaObj = materiaObj.tareas.find(t => String(t.actividad_id) === tareaKey);

        if (!tareaObj) {
          tareaObj = {
            actividad_id: row.actividad_id,
            nombre_actividad: row.nombre_actividad,
            descripcion: row.descripcion,
            fecha_creacion: row.fecha_creacion,
            fecha_entrega: row.fecha_entrega,
            puntaje_maximo: row.puntaje_maximo,
            alumnos: []
          };
          materiaObj.tareas.push(tareaObj);
        }

        tareaObj.alumnos.push({
          alumno_id: row.alumno_id,
          codigo_alumno: row.codigo_alumno,
          nombre_completo: row.nombre_completo,
          nota_obtenida: row.nota_obtenida,
          porcentaje_obtenido: row.porcentaje_obtenido
        });
      }

      const data = Array.from(materiasMap.values());

      return res.status(200).json({
        message: 'Reporte de notas lista de cotejo obtenido correctamente',
        data
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /inexistente/i.test(msg) ||
        /inactivo/i.test(msg) ||
        /inactiva/i.test(msg) ||
        /no existe/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];