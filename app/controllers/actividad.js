/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const Actividad = require('../models/actividad');

/**Operación GET hacia la DB*/
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
  // -------- obligatorios --------
  body('usuario_id')
    .exists().withMessage('usuario_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('usuario_id debe ser entero > 0'),

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

  body('materia_id')
    .exists().withMessage('materia_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('materia_id debe ser entero > 0'),

  body('tipo_actividad_id')
    .exists().withMessage('tipo_actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('tipo_actividad_id debe ser entero > 0'),

  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('ciclo_id debe ser entero > 0'),

  body('nombre_actividad')
    .exists().withMessage('nombre_actividad requerido')
    .bail()
    .isString().withMessage('nombre_actividad debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_actividad requerido')
    .isLength({ max: 255 }).withMessage('nombre_actividad máximo 255 caracteres'),

  body('descripcion')
    .optional({ nullable: true })
    .isString().withMessage('descripcion debe ser texto')
    .trim(),

  body('fecha_entrega')
    .exists().withMessage('fecha_entrega requerida')
    .bail()
    .isISO8601().withMessage('fecha_entrega debe ser una fecha válida'),

  body('puntaje_maximo')
    .exists().withMessage('puntaje_maximo requerido')
    .bail()
    .isFloat({ gt: 0 }).withMessage('puntaje_maximo debe ser mayor a 0'),

  body('estado_actividad_id')
    .exists().withMessage('estado_actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('estado_actividad_id debe ser entero > 0'),

  body('estado')
    .exists().withMessage('estado requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('estado debe ser 0 o 1'),

  body('crear_para_alumnos')
    .exists().withMessage('crear_para_alumnos requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('crear_para_alumnos debe ser 0 o 1'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const usuario_id = Number(req.body.usuario_id);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const materia_id = Number(req.body.materia_id);
      const tipo_actividad_id = Number(req.body.tipo_actividad_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const nombre_actividad = req.body.nombre_actividad.toString().trim();

      const descripcion =
        req.body.descripcion == null || req.body.descripcion === ''
          ? null
          : req.body.descripcion.toString().trim();

      const fecha_entrega = req.body.fecha_entrega;
      const puntaje_maximo = Number(req.body.puntaje_maximo);
      const estado_actividad_id = Number(req.body.estado_actividad_id);
      const estado = Number(req.body.estado);
      const crear_para_alumnos = Number(req.body.crear_para_alumnos);

      const raw = await sequelize.query(
        `CALL sp_actividad_crear(
          :p_usuario_id,
          :p_grado_id,
          :p_seccion_id,
          :p_materia_id,
          :p_tipo_actividad_id,
          :p_ciclo_id,
          :p_nombre_actividad,
          :p_descripcion,
          :p_fecha_entrega,
          :p_puntaje_maximo,
          :p_estado_actividad_id,
          :p_estado,
          :p_crear_para_alumnos
        );`,
        {
          replacements: {
            p_usuario_id: usuario_id,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_materia_id: materia_id,
            p_tipo_actividad_id: tipo_actividad_id,
            p_ciclo_id: ciclo_id,
            p_nombre_actividad: nombre_actividad,
            p_descripcion: descripcion,
            p_fecha_entrega: fecha_entrega,
            p_puntaje_maximo: puntaje_maximo,
            p_estado_actividad_id: estado_actividad_id,
            p_estado: estado,
            p_crear_para_alumnos: crear_para_alumnos
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(201).json({
        message: 'Actividad creada correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /requerid/i.test(msg) ||
        /debe ser 0 o 1/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe/i.test(msg) ||
        /inexistente/i.test(msg) ||
        /inactivo/i.test(msg) ||
        /inactiva/i.test(msg) ||
        /no hay ciclo escolar activo/i.test(msg) ||
        /no se pudo resolver/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /no tiene rol válido/i.test(msg) ||
        /no tiene rol valido/i.test(msg) ||
        /no está asignado/i.test(msg) ||
        /no esta asignado/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
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

exports.obtenerActividadPorId = [
  body('actividad_id')
    .exists().withMessage('actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('actividad_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const actividad_id = Number(req.body.actividad_id);

      const raw = await sequelize.query(
        `CALL sp_actividad_obtener_por_id(:p_actividad_id);`,
        {
          replacements: {
            p_actividad_id: actividad_id
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Actividad obtenida correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /actividad_id inválido/i.test(msg) ||
        /actividad_id invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (/la actividad no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getActividadesPorMateria = [
  body('grado_id').exists().withMessage('grado_id requerido').bail().toInt().isInt({ gt: 0 }),
  body('seccion_id').exists().withMessage('seccion_id requerido').bail().toInt().isInt({ gt: 0 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const grado_id = Number(req.body.grado_id);
    const seccion_id = Number(req.body.seccion_id);

    try {
      // 1) Verificación previa: clase (grado+sección) y ciclo activo existen/están asignados
      const [[pre]] = await sequelize.query(
        `
        SELECT
          gs.grado_seccion_id AS gs_id,
          (
            SELECT ce.ciclo_escolar_id
            FROM Ciclo_Escolar ce
            WHERE ce.estado = 1
            ORDER BY ce.anio DESC
            LIMIT 1
          ) AS ce_id
        FROM Grado_Seccion gs
        WHERE gs.grado_id = :g AND gs.seccion_id = :s AND gs.estado = 1
        LIMIT 1
        `,
        { replacements: { g: grado_id, s: seccion_id } }
      );

      if (!pre || !pre.gs_id) {
        return res.status(400).json({ error: 'La combinación Grado/Sección no existe o está inactiva' });
      }
      if (!pre.ce_id) {
        return res.status(409).json({ error: 'No hay Ciclo_Escolar activo' });
      }

      // (Opcional) verificar que haya maestro asignado a esa clase en el ciclo actual,
      // para evitar que el SP lance la misma excepción n veces:
      const [[mcheck]] = await sequelize.query(
        `
        SELECT COUNT(*) AS cnt
        FROM Maestro_Grado_Seccion
        WHERE grado_seccion_id = :gs AND ciclo_escolar_id = :ce
        `,
        { replacements: { gs: pre.gs_id, ce: pre.ce_id } }
      );
      if (!mcheck || Number(mcheck.cnt) === 0) {
        return res.status(409).json({ error: 'No hay maestro asignado a esa clase en el ciclo actual' });
      }

      // 2) Materias asignadas al grado (se omiten las no asignadas)
      const [materias] = await sequelize.query(
        `
        SELECT m.materia_id, m.nombre_materia
        FROM Materia m
        JOIN Materia_Grado mg ON mg.materia_id = m.materia_id
        WHERE mg.grado_id = :g
          AND m.estado = 1
        ORDER BY m.nombre_materia
        `,
        { replacements: { g: grado_id } }
      );

      // Helper para normalizar respuesta del CALL
      const normalizeCall = (result) => {
        if (!result) return [];
        if (Array.isArray(result) && result.length && typeof result[0] === 'object') return result;
        if (Array.isArray(result) && result.length && Array.isArray(result[0])) return result[0];
        if (Array.isArray(result) && !result.length) return [];
        if (typeof result === 'object') return [result];
        return [];
      };

      // 3) Ejecutar SP por cada materia (en paralelo), omitiendo las que devuelven vacío
      const items = await Promise.all(
        (materias || []).map(async (mat) => {
          try {
            const rows = await sequelize.query(
              `CALL sp_rep_actividades_por_materia(:g, :s, :m);`,
              { replacements: { g: grado_id, s: seccion_id, m: mat.materia_id } }
            );
            const data = normalizeCall(rows);
            if (!data.length) return null; // omitir si no hay actividades
            return {
              materia_id: mat.materia_id,
              nombre_materia: mat.nombre_materia,
              actividades: data
            };
          } catch (e) {
            // Si el SP lanza error específico por catálogos/maestro/ciclo, puedes decidir omitir o propagar.
            // Aquí omitimos sólo si es "No hay maestro..." para no romper el resto;
            // pero como ya pre-validamos, no debería ocurrir.
            const msg = String(e.message || '').toLowerCase();
            if (msg.includes('no hay maestro') || msg.includes('ciclo_escolar')) return null;
            throw e; // otros errores sí se propagan
          }
        })
      );

      // 4) Filtrar nulos (materias sin actividades)
      const data = items.filter(Boolean);

      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.getNotasDetallePorClase = [
  body('grado_id')
    .exists().withMessage('grado_id requerido')
    .bail().toInt().isInt({ gt: 0 }),
  body('seccion_id')
    .exists().withMessage('seccion_id requerido')
    .bail().toInt().isInt({ gt: 0 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      const raw = await sequelize.query(
        'CALL sp_rep_notas_actividades_detalle_por_clase(:g, :s);',
        { replacements: { g: grado_id, s: seccion_id } }
      );

      // Normaliza respuesta del CALL
      let rows = [];
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) rows = raw[0];
        else if (raw.length && typeof raw[0] === 'object') rows = raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      // Agrupa: alumno -> tipos_actividad {1:[...],2:[...],3:[...]}
      const byAlumno = new Map();

      for (const r of rows) {
        const alumnoId = Number(r.alumno_id);
        const key = alumnoId;

        if (!byAlumno.has(key)) {
          byAlumno.set(key, {
            alumno_id: alumnoId,
            alumno_nombre: r.alumno_nombre,
            alumno_apellido: r.alumno_apellido,
            tipos_actividad: { 1: [], 2: [], 3: [] }
          });
        }

        const entry = byAlumno.get(key);
        const tipo = Number(r.tipo_actividad_id);
        if ([1, 2, 3].includes(tipo)) {
          entry.tipos_actividad[tipo].push({
            actividad_id: Number(r.actividad_id),
            nombre_actividad: r.nombre_actividad,
            fecha_entrega: r.fecha_entrega,          // string DATETIME
            materia_id: Number(r.materia_id),
            nombre_materia: r.nombre_materia,
            puntaje_maximo: Number(r.puntaje_maximo),
            puntaje_obtenido: r.puntaje_obtenido != null ? Number(r.puntaje_obtenido) : null,
            porcentaje: r.porcentaje != null ? Number(r.porcentaje) : null
          });
        }
      }

      // Convierte a array ordenado por apellido/nombre (ya viene ordenado del SP, pero por si acaso)
      const data = Array.from(byAlumno.values());

      return res.status(200).json({ data });
    } catch (error) {
      const msg = error?.message || 'Error interno';
      if (/grado|secci[oó]n|ciclo_escolar|inexistente|inactiva/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      return res.status(500).json({ error: msg });
    }
  }
];

/*NUEVO*/

exports.getTareasPendientesPorMateria = [
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
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const anio = Number(req.body.anio);

      // Ejecuta tu SP (devuelve 1 result set con N filas)
      const raw = await sequelize.query(
        'CALL sp_tareas_pendientes_por_grado_seccion_ciclo_anio(:grado,:seccion,:ciclo,:anio);',
        {
          replacements: {
            grado: grado_id,
            seccion: seccion_id,
            ciclo: ciclo_id,
            anio: anio
          }
        }
      );

      // Normalización robusta para MySQL CALL:
      // Puede venir como [ [rows] ] o [rows] o rows
      let rows = [];
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) rows = raw[0];      // [[rows]]
        else rows = raw;                                // [rows]
      } else if (raw && typeof raw === 'object') {
        rows = [raw];                                   // row único (raro)
      }

      // Si el SP no hizo SIGNAL y devolvió vacío, cubrimos acá:
      if (!rows || rows.length === 0) {
        return res.status(404).json({
          error: 'No hay tareas pendientes para esos parámetros'
        });
      }

      // =========================
      // Agrupación por materia
      // =========================
      const byMateria = new Map();

      for (const r of rows) {
        // Si tu SELECT no expone materia_id, lo tomamos desde a.materia_tipo_id NO sirve.
        // RECOMENDADO: agrega "m.materia_id" al SELECT del SP.
        const materia_id = r.materia_id ?? null;
        const nombre_materia = r.nombre_materia ?? 'SIN_MATERIA';

        const key = materia_id ?? `NO_ID::${nombre_materia}`;

        if (!byMateria.has(key)) {
          byMateria.set(key, {
            materia_id,
            nombre_materia,
            total_pendientes: 0,
            tareas: []
          });
        }

        const bucket = byMateria.get(key);
        bucket.tareas.push(r);
        bucket.total_pendientes += 1;
      }

      const data = Array.from(byMateria.values())
        .sort((a, b) => String(a.nombre_materia).localeCompare(String(b.nombre_materia)));

      return res.status(200).json({ data });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      // Mapeo de SIGNAL del SP a HTTP codes “limpios”
      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg) || /no hay tareas pendientes/i.test(msg)) {
        // lo tratamos como 404 (o 409 si prefieres “conflicto de estado”)
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getCalificacionesAlumnosPorMateria = [
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

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const anio = Number(req.body.anio);
      const ciclo_id = Number(req.body.ciclo_id);

      const raw = await sequelize.query(
        'CALL sp_calificaciones_tareas(:grado,:seccion,:anio,:ciclo);',
        { replacements: { grado: grado_id, seccion: seccion_id, anio, ciclo: ciclo_id } }
      );

      // Normalización robusta
      let rows = [];
      if (Array.isArray(raw)) {
        rows = Array.isArray(raw[0]) ? raw[0] : raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No hay información para esos parámetros.' });
      }

      // materia_id -> bucket
      const byMateria = new Map();

      for (const r of rows) {
        // Si no hay tareas (actividad_id null), no hay materia_id; ignoramos
        if (!r.materia_id) continue;

        const materia_id = Number(r.materia_id);
        const nombre_materia = r.nombre_materia ?? '';

        if (!byMateria.has(materia_id)) {
          byMateria.set(materia_id, {
            materia_id,
            nombre_materia,
            // alumno_id -> acumulado
            _alumnosMap: new Map()
          });
        }

        const mat = byMateria.get(materia_id);

        const alumno_id = r.alumno_id != null ? Number(r.alumno_id) : null;
        if (!alumno_id) continue;

        if (!mat._alumnosMap.has(alumno_id)) {
          mat._alumnosMap.set(alumno_id, {
            alumno_id,
            codigo_alumno: r.codigo_alumno ?? null,
            alumno_nombre_completo: r.alumno_nombre + " " + r.alumno_apellido ?? '',
            puntaje_obtenido_total: 0
          });
        }

        const a = mat._alumnosMap.get(alumno_id);
        a.puntaje_obtenido_total += (r.puntaje_obtenido != null ? Number(r.puntaje_obtenido) : 0);
      }

      const data = Array.from(byMateria.values())
        .map(mat => ({
          materia_id: mat.materia_id,
          nombre_materia: mat.nombre_materia,
          alumnos: Array.from(mat._alumnosMap.values())
            .sort((x, y) => {
              const ap = String(x.alumno_apellido || '').localeCompare(String(y.alumno_apellido || ''));
              if (ap !== 0) return ap;
              return String(x.alumno_nombre || '').localeCompare(String(y.alumno_nombre || ''));
            })
        }))
        .sort((a, b) => (a.materia_id - b.materia_id));

      return res.status(200).json({ data });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getActividadesPorTipo = [
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
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const anio = Number(req.body.anio);

      const raw = await sequelize.query(
        'CALL sp_tareas_pendientes_por_grado_seccion_ciclo_anio(:grado,:seccion,:ciclo,:anio);',
        {
          replacements: {
            grado: grado_id,
            seccion: seccion_id,
            ciclo: ciclo_id,
            anio: anio
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) {
        rows = Array.isArray(raw[0]) ? raw[0] : raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No hay tareas pendientes para esos parámetros' });
      }

      // ======================================================
      // NUEVO MAPEO:
      // Materia -> TipoActividad (tipo_actividad_id) -> Actividades
      // ======================================================
      const byMateria = new Map();

      for (const r of rows) {
        const materia_id = r.materia_id ?? null;                // REQUIERE que el SP exponga m.materia_id
        const nombre_materia = r.nombre_materia ?? 'SIN_MATERIA';

        // En tu SP actual solo venía "tipo_actividad" (descripcion_tipo).
        // Para agrupar por ID, REQUIERE que el SP exponga: ta.tipo_actividad_id AS tipo_actividad_id
        const tipo_actividad_id = r.tipo_actividad_id ?? null;
        const tipo_actividad = r.tipo_actividad ?? 'SIN_TIPO';

        const materiaKey = materia_id ?? `NO_ID::${nombre_materia}`;
        if (!byMateria.has(materiaKey)) {
          byMateria.set(materiaKey, {
            materia_id,
            nombre_materia,
            tipos: new Map() // tipo_actividad_id -> { tipo_actividad_id, tipo_actividad, actividades: [] }
          });
        }

        const mat = byMateria.get(materiaKey);

        const tipoKey = tipo_actividad_id ?? `NO_ID::${tipo_actividad}`;
        if (!mat.tipos.has(tipoKey)) {
          mat.tipos.set(tipoKey, {
            tipo_actividad_id,
            tipo_actividad,
            actividades: []
          });
        }

        const tipo = mat.tipos.get(tipoKey);

        // Actividad con SOLO los campos que pediste
        tipo.actividades.push({
          actividad_id: r.actividad_id != null ? Number(r.actividad_id) : null,
          nombre_actividad: r.nombre_actividad ?? '',
          descripcion: r.descripcion ?? '',
          fecha_creacion: r.fecha_creacion ?? null,
          fecha_entrega: r.fecha_entrega ?? null,
          puntaje_maximo: r.puntaje_maximo ?? 0,
          estado_actividad: r.estado_actividad ?? '' // "Pendiente"
        });
      }

      // Convertir Maps -> Arrays y ordenar
      const data = Array.from(byMateria.values())
        .map(m => ({
          materia_id: m.materia_id,
          nombre_materia: m.nombre_materia,
          tipos_actividad: Array.from(m.tipos.values())
            .map(t => ({
              tipo_actividad_id: t.tipo_actividad_id,
              tipo_actividad: t.tipo_actividad,
              actividades: t.actividades.sort((a, b) => {
                const da = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : 0;
                const db = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : 0;
                return da - db;
              })
            }))
            .sort((a, b) => (Number(a.tipo_actividad_id || 0) - Number(b.tipo_actividad_id || 0)))
        }))
        .sort((a, b) => String(a.nombre_materia).localeCompare(String(b.nombre_materia)));

      return res.status(200).json({ data });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg) || /no hay tareas pendientes/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getActividadesCalificadasPorMateria = [
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
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const anio = Number(req.body.anio);

      const raw = await sequelize.query(
        'CALL sp_actividades_calificadas(:grado,:seccion,:ciclo,:anio);',
        {
          replacements: {
            grado: grado_id,
            seccion: seccion_id,
            ciclo: ciclo_id,
            anio: anio
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No hay actividades calificadas para esos parámetros' });
      }

      const byMateria = new Map();

      for (const r of rows) {
        const materia_id = r.materia_id != null ? Number(r.materia_id) : null;
        const nombre_materia = r.nombre_materia ?? 'SIN_MATERIA';

        const tipo_actividad_id = r.tipo_actividad_id != null ? Number(r.tipo_actividad_id) : null;
        const tipo_actividad = r.tipo_actividad ?? 'SIN_TIPO';

        const materiaKey = materia_id ?? `NO_ID::${nombre_materia}`;

        if (!byMateria.has(materiaKey)) {
          byMateria.set(materiaKey, {
            materia_id,
            nombre_materia,
            tipos: new Map()
          });
        }

        const mat = byMateria.get(materiaKey);

        const tipoKey = tipo_actividad_id ?? `NO_ID::${tipo_actividad}`;
        if (!mat.tipos.has(tipoKey)) {
          mat.tipos.set(tipoKey, {
            tipo_actividad_id,
            tipo_actividad,
            actividades: []
          });
        }

        const tipo = mat.tipos.get(tipoKey);

        tipo.actividades.push({
          actividad_id: r.actividad_id != null ? Number(r.actividad_id) : null,
          nombre_actividad: r.nombre_actividad ?? '',
          descripcion: r.descripcion ?? '',
          fecha_creacion: r.fecha_creacion ?? null,
          fecha_entrega: r.fecha_entrega ?? null,
          puntaje_maximo: r.puntaje_maximo ?? 0,
          ciclo_id: r.ciclo_id != null ? Number(r.ciclo_id) : null,
          estado_actividad: r.estado_actividad ?? '' // "Calificada"
        });
      }

      const data = Array.from(byMateria.values())
        .map(m => ({
          materia_id: m.materia_id,
          nombre_materia: m.nombre_materia,
          tipos_actividad: Array.from(m.tipos.values())
            .sort((a, b) => (Number(a.tipo_actividad_id || 0) - Number(b.tipo_actividad_id || 0)))
            .map(t => ({
              tipo_actividad_id: t.tipo_actividad_id,
              tipo_actividad: t.tipo_actividad,
              actividades: t.actividades.sort((a, b) => {
                const da = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : 0;
                const db = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : 0;
                if (da !== db) return da - db;
                return (a.actividad_id || 0) - (b.actividad_id || 0);
              })
            }))
        }))
        .sort((a, b) => String(a.nombre_materia).localeCompare(String(b.nombre_materia)));

      return res.status(200).json({ data });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';
      
      if (/inválido/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getTareasAgrupadasPorAviso = [

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
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {

      const grado_id   = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id   = Number(req.body.ciclo_id);
      const anio       = Number(req.body.anio);

      const raw = await sequelize.query(
        'CALL sp_tareas_pendientes_por_grado_seccion_ciclo_anio(:grado,:seccion,:ciclo,:anio);',
        {
          replacements: {
            grado: grado_id,
            seccion: seccion_id,
            ciclo: ciclo_id,
            anio: anio
          }
        }
      );

      // Normalización robusta
      let rows = [];
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) rows = raw[0];
        else rows = raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          error: 'No hay tareas pendientes para esos parámetros'
        });
      }

      // ============================================
      // Agrupar por aviso_actividad (1 a 4)
      // ============================================
      const agrupado = new Map();

      for (const r of rows) {

        const aviso = Number(r.aviso_actividad);

        if (!aviso || aviso < 1 || aviso > 4) {
          // Si viene algo fuera de rango lo ignoramos
          continue;
        }

        if (!agrupado.has(aviso)) {
          agrupado.set(aviso, {
            aviso_actividad: aviso,
            total_actividades: 0,
            actividades: []
          });
        }

        const bucket = agrupado.get(aviso);

        bucket.actividades.push({
          id_actividad: r.id_actividad,
          nombre_actividad: r.nombre_actividad,
          descripcion: r.descripcion,
          fecha_creacion: r.fecha_creacion,
          fecha_entrega: r.fecha_entrega,
          puntaje_maximo: r.puntaje_maximo,
          aviso_actividad: aviso,
          materia_id: r.materia_id,
          nombre_materia: r.nombre_materia
        });

        bucket.total_actividades += 1;
      }

      const data = Array.from(agrupado.values())
        .sort((a, b) => a.aviso_actividad - b.aviso_actividad);

      return res.status(200).json({ data });

    } catch (error) {

      const msg = (error && error.message)
        ? String(error.message)
        : 'Error interno';

      if (/parámetro inválido/i.test(msg) || /inválido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }

      if (/no existe/i.test(msg) || /no hay tareas pendientes/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.getNotasAlumnosTareasCalificadas = [
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
    .isInt({ min: 1, max: 4 }).withMessage('ciclo_id debe estar entre 1 y 4'),

  body('anio')
    .exists().withMessage('anio requerido')
    .bail()
    .toInt()
    .isInt({ min: 2000, max: 2100 }).withMessage('anio fuera de rango (2000–2100)'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const ciclo_id = Number(req.body.ciclo_id);
      const anio = Number(req.body.anio);

      const raw = await sequelize.query(
        'CALL sp_notas_alumnos_tareas_cal(:grado,:seccion,:ciclo,:anio);',
        { replacements: { grado: grado_id, seccion: seccion_id, ciclo: ciclo_id, anio } }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No hay registros para esos parámetros.' });
      }

      // ======================================================
      // Agrupar: Materia -> Actividad -> Alumnos
      // ======================================================
      const byMateria = new Map();

      for (const r of rows) {
        const materia_id = r.materia_id != null ? Number(r.materia_id) : null;
        const actividad_id = r.actividad_id != null ? Number(r.actividad_id) : null;
        if (!materia_id || !actividad_id) continue;

        const nombre_materia = r.nombre_materia ?? '';

        if (!byMateria.has(materia_id)) {
          byMateria.set(materia_id, {
            materia_id,
            nombre_materia,
            _actividadesMap: new Map()
          });
        }

        const mat = byMateria.get(materia_id);

        if (!mat._actividadesMap.has(actividad_id)) {
          mat._actividadesMap.set(actividad_id, {
            actividad_id,
            nombre_actividad: r.nombre_actividad ?? '',
            fecha_entrega: r.fecha_entrega ?? null,
            puntaje_maximo: r.puntaje_maximo ?? 0,
            ciclo_id: r.ciclo_id != null ? Number(r.ciclo_id) : null,
            _alumnosMap: new Map()
          });
        }

        const act = mat._actividadesMap.get(actividad_id);

        const alumno_id = r.alumno_id != null ? Number(r.alumno_id) : null;
        if (!alumno_id) continue;

        // Como el SP devuelve 1 fila por alumno x actividad, aquí guardamos directo.
        // Si por alguna razón vinieran duplicados, nos quedamos con el último (o el mayor).
        act._alumnosMap.set(alumno_id, {
          alumno_id,
          codigo_alumno: r.codigo_alumno ?? null,
          alumno_nombre: r.alumno_nombre ?? '',
          alumno_apellido: r.alumno_apellido ?? '',
          puntaje_obtenido: r.puntaje_obtenido != null ? Number(r.puntaje_obtenido) : 0
        });
      }

      const data = Array.from(byMateria.values())
        .map(m => {
          const actividades = Array.from(m._actividadesMap.values())
            .map(a => ({
              actividad_id: a.actividad_id,
              nombre_actividad: a.nombre_actividad,
              fecha_entrega: a.fecha_entrega,
              puntaje_maximo: a.puntaje_maximo,
              ciclo_id: a.ciclo_id,
              alumnos: Array.from(a._alumnosMap.values()).sort((x, y) => {
                const ap = String(x.alumno_apellido || '').localeCompare(String(y.alumno_apellido || ''));
                if (ap !== 0) return ap;
                return String(x.alumno_nombre || '').localeCompare(String(y.alumno_nombre || ''));
              })
            }))
            .sort((a, b) => {
              const da = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : 0;
              const db = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : 0;
              if (da !== db) return da - db;
              return (a.actividad_id || 0) - (b.actividad_id || 0);
            });

          return {
            materia_id: m.materia_id,
            nombre_materia: m.nombre_materia,
            actividades
          };
        })
        .sort((a, b) => {
          // si quieres por materia_id numérico:
          return (a.materia_id - b.materia_id);
          // o por nombre: String(a.nombre_materia).localeCompare(String(b.nombre_materia))
        });

      return res.status(200).json({ data });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/inválido/i.test(msg) || /invalido/i.test(msg) || /parámetro/i.test(msg) || /parametro/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarActividad = [
  body('actividad_id')
    .exists().withMessage('actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('actividad_id debe ser entero > 0'),

  body('nombre_actividad')
    .exists().withMessage('nombre_actividad requerido')
    .bail()
    .isString().withMessage('nombre_actividad debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_actividad requerido')
    .isLength({ max: 150 }).withMessage('nombre_actividad máximo 150 caracteres'),

  body('puntaje_maximo')
    .exists().withMessage('puntaje_maximo requerido')
    .bail()
    .isFloat({ gt: 0 }).withMessage('puntaje_maximo inválido'),

  body('fecha_entrega')
    .exists().withMessage('fecha_entrega requerida')
    .bail()
    .isISO8601().withMessage('fecha_entrega debe ser una fecha válida'),

  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('ciclo_id inválido'),

  body('tipo_actividad_id')
    .exists().withMessage('tipo_actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('tipo_actividad_id inválido'),

  body('estado_actividad_id')
    .exists().withMessage('estado_actividad_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('estado_actividad_id inválido'),

  body('descripcion')
    .exists().withMessage('descripcion requerida')
    .bail()
    .isString().withMessage('descripcion debe ser texto')
    .trim()
    .notEmpty().withMessage('descripcion requerida'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const actividad_id = Number(req.body.actividad_id);
      const nombre_actividad = req.body.nombre_actividad.toString().trim();
      const puntaje_maximo = Number(req.body.puntaje_maximo);
      const fecha_entrega = req.body.fecha_entrega;
      const ciclo_id = Number(req.body.ciclo_id);
      const tipo_actividad_id = Number(req.body.tipo_actividad_id);
      const estado_actividad_id = Number(req.body.estado_actividad_id);
      const descripcion = req.body.descripcion.toString().trim();

      const raw = await sequelize.query(
        `CALL sp_actividad_actualizar(
          :p_actividad_id,
          :p_nombre_actividad,
          :p_puntaje_maximo,
          :p_fecha_entrega,
          :p_ciclo_id,
          :p_tipo_actividad_id,
          :p_estado_actividad_id,
          :p_descripcion
        );`,
        {
          replacements: {
            p_actividad_id: actividad_id,
            p_nombre_actividad: nombre_actividad,
            p_puntaje_maximo: puntaje_maximo,
            p_fecha_entrega: fecha_entrega,
            p_ciclo_id: ciclo_id,
            p_tipo_actividad_id: tipo_actividad_id,
            p_estado_actividad_id: estado_actividad_id,
            p_descripcion: descripcion
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Actividad actualizada correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /actividad_id inválido/i.test(msg) ||
        /actividad_id invalido/i.test(msg) ||
        /nombre_actividad requerido/i.test(msg) ||
        /puntaje_maximo inválido/i.test(msg) ||
        /puntaje_maximo invalido/i.test(msg) ||
        /fecha_entrega requerida/i.test(msg) ||
        /ciclo_id inválido/i.test(msg) ||
        /ciclo_id invalido/i.test(msg) ||
        /tipo_actividad_id inválido/i.test(msg) ||
        /tipo_actividad_id invalido/i.test(msg) ||
        /estado_actividad_id inválido/i.test(msg) ||
        /estado_actividad_id invalido/i.test(msg) ||
        /descripcion requerida/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /la actividad no existe/i.test(msg) ||
        /el ciclo no existe o está inactivo/i.test(msg) ||
        /el ciclo no existe o esta inactivo/i.test(msg) ||
        /el tipo de actividad no existe o está inactivo/i.test(msg) ||
        /el tipo de actividad no existe o esta inactivo/i.test(msg) ||
        /el estado de actividad no existe/i.test(msg) ||
        /no fue posible resolver la materia de la actividad/i.test(msg) ||
        /la materia de la actividad no tiene configurado el tipo de actividad indicado/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];