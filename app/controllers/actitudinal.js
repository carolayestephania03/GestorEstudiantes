/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');

exports.getDataTopicos = async (req, res) => {
  try {
    const [data] = await sequelize.query("SELECT * FROM actitudinal_topico where estado = 1");
    res.send({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.configuracionNotas = [
  // -------- obligatorios --------
  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('ciclo_id debe ser entero > 0'),

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
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido'),

  body('puntaje_actitudinal')
    .exists().withMessage('puntaje_actitudinal requerido')
    .bail()
    .isFloat({ min: 0 }).withMessage('puntaje_actitudinal inválido'),

  body('puntaje_declarativo')
    .exists().withMessage('puntaje_declarativo requerido')
    .bail()
    .isFloat({ min: 0 }).withMessage('puntaje_declarativo inválido'),

  body('puntaje_procedimental')
    .exists().withMessage('puntaje_procedimental requerido')
    .bail()
    .isFloat({ min: 0 }).withMessage('puntaje_procedimental inválido'),

  body('topicos')
    .exists().withMessage('topicos requerido')
    .bail()
    .isArray({ min: 1 }).withMessage('topicos debe ser un arreglo con al menos un elemento'),

  body('topicos.*.topico_id')
    .exists().withMessage('topico_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('topico_id debe ser entero > 0'),

  body('topicos.*.puntaje_topico')
    .exists().withMessage('puntaje_topico requerido')
    .bail()
    .isFloat({ gt: 0 }).withMessage('puntaje_topico debe ser mayor a 0'),

  body('topicos.*.orden')
    .exists().withMessage('orden requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('orden debe ser entero > 0'),

  // -------- validaciones cruzadas --------
  body().custom(({ topicos, puntaje_actitudinal, puntaje_declarativo, puntaje_procedimental }) => {
    if (!Array.isArray(topicos) || topicos.length === 0) {
      throw new Error('Debe enviar al menos un tópico');
    }

    const totalNotas =
      Number(puntaje_actitudinal || 0) +
      Number(puntaje_declarativo || 0) +
      Number(puntaje_procedimental || 0);

    if (Number(totalNotas.toFixed(2)) !== 100.00) {
      throw new Error('La suma de actitudinal + declarativo + procedimental debe ser 100');
    }

    const ids = topicos.map(t => Number(t.topico_id));
    const idsUnicos = new Set(ids);
    if (ids.length !== idsUnicos.size) {
      throw new Error('No se permite repetir topico_id en topicos');
    }

    const sumaTopicos = topicos.reduce((acc, t) => acc + Number(t.puntaje_topico || 0), 0);
    if (Number(sumaTopicos.toFixed(2)) !== Number(Number(puntaje_actitudinal).toFixed(2))) {
      throw new Error('La suma de puntaje_topico debe ser igual a puntaje_actitudinal');
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ciclo_id = Number(req.body.ciclo_id);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const anio = Number(req.body.anio);

      const puntaje_actitudinal = Number(req.body.puntaje_actitudinal);
      const puntaje_declarativo = Number(req.body.puntaje_declarativo);
      const puntaje_procedimental = Number(req.body.puntaje_procedimental);

      const topicos = req.body.topicos.map(t => ({
        topico_id: Number(t.topico_id),
        puntaje_topico: Number(t.puntaje_topico),
        orden: Number(t.orden)
      }));

      const topicos_json = JSON.stringify(topicos);

      const raw = await sequelize.query(
        `CALL sp_configuracion_notas(
          :p_ciclo_id,
          :p_grado_id,
          :p_seccion_id,
          :p_anio,
          :p_puntaje_actitudinal,
          :p_puntaje_declarativo,
          :p_puntaje_procedimental,
          :p_topicos_json
        );`,
        {
          replacements: {
            p_ciclo_id: ciclo_id,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_anio: anio,
            p_puntaje_actitudinal: puntaje_actitudinal,
            p_puntaje_declarativo: puntaje_declarativo,
            p_puntaje_procedimental: puntaje_procedimental,
            p_topicos_json: topicos_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Configuración de notas guardada correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /debe enviar al menos un tópico/i.test(msg) ||
        /debe enviar al menos un topico/i.test(msg) ||
        /no se permite repetir topico_id/i.test(msg) ||
        /la suma de actitudinal \+ declarativo \+ procedimental debe ser 100/i.test(msg) ||
        /la suma de puntaje_topico debe ser igual a puntaje_actitudinal/i.test(msg) ||
        /puntaje\/orden incorrecto/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe ciclo escolar activo/i.test(msg) ||
        /no existe asignación maestro_grado_seccion activa/i.test(msg) ||
        /no existe asignacion maestro_grado_seccion activa/i.test(msg) ||
        /la combinación grado\/sección no existe o está inactiva/i.test(msg) ||
        /la combinación grado\/sección no existe o esta inactiva/i.test(msg) ||
        /ciclo inexistente o inactivo/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.obtenerActitudinalAlumnos = [
  // -------- obligatorios --------
  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('ciclo_id debe ser entero > 0'),

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
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ciclo_id = Number(req.body.ciclo_id);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const anio = Number(req.body.anio);

      const raw = await sequelize.query(
        `CALL sp_actitudinal_alumnos_obtener(
          :p_ciclo_id,
          :p_grado_id,
          :p_seccion_id,
          :p_anio
        );`,
        {
          replacements: {
            p_ciclo_id: ciclo_id,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_anio: anio
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      if (!rows || rows.length === 0) {
        return res.status(200).json({
          message: 'Actitudinal de alumnos obtenido correctamente',
          configuracion: null,
          alumnos: []
        });
      }

      // -------- configuración general (una sola vez) --------
      const first = rows[0];
      const configuracion = {
        grado_id: Number(first.grado_id),
        seccion_id: Number(first.seccion_id),
        ciclo_id: Number(first.ciclo_id),
        puntaje_maximo_actitudinal: Number(first.puntaje_maximo_actitudinal),
        puntaje_maximo_declarativo: Number(first.puntaje_maximo_declarativo),
        puntaje_maximo_procedimental: Number(first.puntaje_maximo_procedimental)
      };

      // -------- agrupar por alumno --------
      const alumnosMap = new Map();

      for (const row of rows) {
        const alumnoId = Number(row.alumno_id);

        if (!alumnosMap.has(alumnoId)) {
          alumnosMap.set(alumnoId, {
            alumno_id: alumnoId,
            codigo_alumno: row.codigo_alumno,
            nombre_completo: row.nombre_completo,
            dpi: row.dpi,
            detalles: []
          });
        }

        const alumno = alumnosMap.get(alumnoId);

        alumno.detalles.push({
          configuracion_detalle_id: Number(row.configuracion_detalle_id),
          topico_id: Number(row.topico_id),
          nombre_topico: row.nombre_topico,
          puntaje_maximo_topico: Number(row.puntaje_maximo_topico),
          puntaje_obtenido: Number(row.puntaje_obtenido),
          observacion: row.observacion
        });
      }

      const alumnos = Array.from(alumnosMap.values());

      return res.status(200).json({
        message: 'Actitudinal de alumnos obtenido correctamente',
        configuracion,
        total_alumnos: alumnos.length,
        alumnos
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
        /no existe ciclo escolar activo/i.test(msg) ||
        /no existe asignación maestro_grado_seccion activa/i.test(msg) ||
        /no existe asignacion maestro_grado_seccion activa/i.test(msg) ||
        /no existe configuración actitudinal/i.test(msg) ||
        /no existe configuracion actitudinal/i.test(msg) ||
        /no existe o está inactiva/i.test(msg) ||
        /no existe o esta inactiva/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.guardarActitudinalAlumnos = [
  // -------- obligatorios --------
  body('ciclo_id')
    .exists().withMessage('ciclo_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('ciclo_id debe ser entero > 0'),

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
    .isInt({ min: 2000, max: 2100 }).withMessage('anio inválido'),

  body('alumnos')
    .exists().withMessage('alumnos requerido')
    .bail()
    .isArray({ min: 1 }).withMessage('alumnos debe ser un arreglo con al menos un elemento'),

  body('alumnos.*.alumno_id')
    .exists().withMessage('alumno_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('alumno_id debe ser entero > 0'),

  body('alumnos.*.detalles')
    .exists().withMessage('detalles requerido')
    .bail()
    .isArray({ min: 1 }).withMessage('detalles debe ser un arreglo con al menos un elemento'),

  body('alumnos.*.detalles.*.topico_id')
    .exists().withMessage('topico_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('topico_id debe ser entero > 0'),

  body('alumnos.*.detalles.*.puntaje_obtenido')
    .exists().withMessage('puntaje_obtenido requerido')
    .bail()
    .isFloat({ min: 0 }).withMessage('puntaje_obtenido debe ser mayor o igual a 0'),

  body('alumnos.*.detalles.*.observacion')
    .optional({ nullable: true })
    .isString().withMessage('observacion debe ser texto')
    .trim(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ciclo_id = Number(req.body.ciclo_id);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);
      const anio = Number(req.body.anio);

      const alumnos = req.body.alumnos.map(alumno => ({
        alumno_id: Number(alumno.alumno_id),
        detalles: Array.isArray(alumno.detalles)
          ? alumno.detalles.map(det => ({
              topico_id: Number(det.topico_id),
              puntaje_obtenido: Number(det.puntaje_obtenido),
              observacion:
                det.observacion == null || det.observacion === ''
                  ? null
                  : det.observacion.toString().trim()
            }))
          : []
      }));

      const alumnos_json = JSON.stringify(alumnos);

      const raw = await sequelize.query(
        `CALL sp_actitudinal_alumnos_guardar(
          :p_ciclo_id,
          :p_grado_id,
          :p_seccion_id,
          :p_anio,
          :p_alumnos_json
        );`,
        {
          replacements: {
            p_ciclo_id: ciclo_id,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_anio: anio,
            p_alumnos_json: alumnos_json
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Actitudinal por alumnos guardado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /no contiene detalles de alumnos/i.test(msg) ||
        /existen alumnos, tópicos o puntajes inválidos/i.test(msg) ||
        /existen alumnos, topicos o puntajes invalidos/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe ciclo escolar activo/i.test(msg) ||
        /no existe asignación maestro_grado_seccion activa/i.test(msg) ||
        /no existe asignacion maestro_grado_seccion activa/i.test(msg) ||
        /no existe configuración actitudinal/i.test(msg) ||
        /no existe configuracion actitudinal/i.test(msg) ||
        /no existe o está inactiva/i.test(msg) ||
        /no existe o esta inactiva/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.crearTopicoActitudinal = [
  /* ---------- Validaciones ---------- */
  body('nombre_topico')
    .trim()
    .notEmpty().withMessage('nombre_topico es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres')
    .custom(v => {
      if (v.includes(';') || v.includes('--')) {
        throw new Error('Caracteres inválidos');
      }
      return true;
    }),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),

  /* ---------- Controller ---------- */
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const nombre_topico = req.body.nombre_topico.trim();
      const descripcion = req.body.descripcion || null;
      const estado = Number(req.body.estado);

      const raw = await sequelize.query(
        `CALL sp_actitudinal_topico_crear(
          :p_nombre_topico,
          :p_descripcion,
          :p_estado
        );`,
        {
          replacements: {
            p_nombre_topico: nombre_topico,
            p_descripcion: descripcion,
            p_estado: 1 // Siempre activo al crear
          }
        }
      );

      /* ---------- Normalización respuesta MySQL ---------- */
      let result = [];
      if (Array.isArray(raw)) result = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') result = [raw];

      return res.status(201).json({
        message: 'Tópico actitudinal creado correctamente',
        data: result[0] || null
      });

    } catch (error) {
      const msg = error?.message || 'Error interno';

      /* ---------- Errores controlados del SP ---------- */
      if (
        /requerido/i.test(msg) ||
        /inválido/i.test(msg) ||
        /invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (/ya existe/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarTopicoActitudinal = [
  /* ---------- Validaciones ---------- */
  body('topico_id')
    .exists().withMessage('topico_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('topico_id debe ser entero > 0'),

  body('nombre_topico')
    .trim()
    .notEmpty().withMessage('nombre_topico es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres')
    .custom(v => {
      if (v.includes(';') || v.includes('--')) {
        throw new Error('Caracteres inválidos');
      }
      return true;
    }),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),

  body('estado')
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('estado debe ser 0 o 1'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const topico_id = Number(req.body.topico_id);
      const nombre_topico = req.body.nombre_topico.trim();
      const descripcion = req.body.descripcion || null;
      const estado = Number(req.body.estado);

      const raw = await sequelize.query(
        `CALL sp_actitudinal_topico_actualizar(
          :p_topico_id,
          :p_nombre_topico,
          :p_descripcion,
          :p_estado
        );`,
        {
          replacements: {
            p_topico_id: topico_id,
            p_nombre_topico: nombre_topico,
            p_descripcion: descripcion,
            p_estado: estado
          }
        }
      );

      let result = [];
      if (Array.isArray(raw)) result = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') result = [raw];

      return res.status(200).json({
        message: 'Tópico actitudinal actualizado correctamente',
        data: result[0] || null
      });

    } catch (error) {
      const msg = error?.message || 'Error interno';

      if (
        /inválido/i.test(msg) ||
        /invalido/i.test(msg) ||
        /requerido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      if (/ya existe otro ámbito\/tópico con ese nombre/i.test(msg) || /ya existe otro ambito\/topico con ese nombre/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.eliminarTopicoActitudinal = [
  /* ---------- Validaciones ---------- */
  body('topico_id')
    .exists().withMessage('topico_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('topico_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const topico_id = Number(req.body.topico_id);

      const raw = await sequelize.query(
        `CALL sp_actitudinal_topico_eliminar(:p_topico_id);`,
        {
          replacements: {
            p_topico_id: topico_id
          }
        }
      );

      let result = [];
      if (Array.isArray(raw)) result = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') result = [raw];

      return res.status(200).json({
        message: 'Tópico actitudinal eliminado correctamente',
        data: result[0] || null
      });

    } catch (error) {
      const msg = error?.message || 'Error interno';

      if (/inválido/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }

      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      if (/ya está inactivo/i.test(msg) || /ya esta inactivo/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];