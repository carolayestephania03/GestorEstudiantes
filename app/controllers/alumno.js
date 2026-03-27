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

exports.buscarAlumnosSimple = [
  // -------- opcionales --------
  body('codigo_alumno')
    .optional({ nullable: true })
    .isString().withMessage('codigo_alumno debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('codigo_alumno máximo 20 caracteres'),

  body('nombre')
    .optional({ nullable: true })
    .isString().withMessage('nombre debe ser texto')
    .trim()
    .isLength({ max: 150 }).withMessage('nombre máximo 150 caracteres'),

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
    .isString().withMessage('dpi debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('dpi máximo 20 caracteres'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const codigo_alumno =
        req.body.codigo_alumno == null || req.body.codigo_alumno === ''
          ? null
          : req.body.codigo_alumno.toString().trim();

      const nombre =
        req.body.nombre == null || req.body.nombre === ''
          ? null
          : req.body.nombre.toString().trim();

      const grado_id =
        req.body.grado_id == null || req.body.grado_id === ''
          ? null
          : Number(req.body.grado_id);

      const seccion_id =
        req.body.seccion_id == null || req.body.seccion_id === ''
          ? null
          : Number(req.body.seccion_id);

      const dpi =
        req.body.dpi == null || req.body.dpi === ''
          ? null
          : req.body.dpi.toString().trim();

      const raw = await sequelize.query(
        `CALL sp_buscar_alumnos_simple(
          :p_codigo_alumno,
          :p_nombre,
          :p_grado_id,
          :p_seccion_id,
          :p_dpi
        );`,
        {
          replacements: {
            p_codigo_alumno: codigo_alumno,
            p_nombre: nombre,
            p_grado_id: grado_id,
            p_seccion_id: seccion_id,
            p_dpi: dpi
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/no hay ciclo_escolar activo/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      if (/inválid/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
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

exports.crearAlumnoConEncargado = [
  // =========================
  // VALIDACIONES (según SP)
  // =========================
  body('alumno_nombre')
    .trim()
    .notEmpty().withMessage('alumno_nombre requerido')
    .isLength({ max: 50 }).withMessage('alumno_nombre: máximo 50')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_apellido')
    .trim()
    .notEmpty().withMessage('alumno_apellido requerido')
    .isLength({ max: 50 }).withMessage('alumno_apellido: máximo 50')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_correo')
    .trim()
    .notEmpty().withMessage('alumno_correo requerido')
    .isEmail().withMessage('alumno_correo inválido')
    .isLength({ max: 100 }).withMessage('alumno_correo: máximo 100')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_telefono')
    .trim()
    .notEmpty().withMessage('alumno_telefono requerido')
    .isLength({ max: 20 }).withMessage('alumno_telefono: máximo 20')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_residencia')
    .trim()
    .notEmpty().withMessage('alumno_residencia requerida')
    .isLength({ max: 255 }).withMessage('alumno_residencia: máximo 255')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_genero_id')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('alumno_genero_id debe ser 1 carácter'),

  body('alumno_dpi')
    .trim()
    .notEmpty().withMessage('alumno_dpi requerido')
    .isLength({ max: 20 }).withMessage('alumno_dpi: máximo 20')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('alumno_fecha_nacimiento')
    .notEmpty().withMessage('alumno_fecha_nacimiento requerido')
    .isISO8601().withMessage('alumno_fecha_nacimiento debe ser YYYY-MM-DD'),

  body('alumno_nit')
    .trim()
    .notEmpty().withMessage('alumno_nit requerido')
    .isLength({ max: 15 }).withMessage('alumno_nit: máximo 15')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('codigo_alumno')
    .trim()
    .notEmpty().withMessage('codigo_alumno requerido')
    .isLength({ max: 20 }).withMessage('codigo_alumno: máximo 20')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('estado_alumno_id')
    .toInt()
    .isInt({ min: 1 }).withMessage('estado_alumno_id inválido'),

  body('enc_nombre')
    .trim()
    .notEmpty().withMessage('enc_nombre requerido')
    .isLength({ max: 50 }).withMessage('enc_nombre: máximo 50')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('enc_apellido')
    .trim()
    .notEmpty().withMessage('enc_apellido requerido')
    .isLength({ max: 50 }).withMessage('enc_apellido: máximo 50')
    .custom(v => { if (v.includes(';') || v.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('crear_matricula')
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('crear_matricula debe ser 0 o 1'),

  body('grado_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ min: 1 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ min: 1 }).withMessage('seccion_id debe ser entero > 0'),

  // Validación cruzada: si crear_matricula=1 entonces grado_id y seccion_id son obligatorios
  body().custom((_, { req }) => {
    const crear = Number(req.body.crear_matricula);
    const grado = req.body.grado_id;
    const seccion = req.body.seccion_id;

    if (crear === 1) {
      if (grado === undefined || grado === null || Number(grado) <= 0) {
        throw new Error('grado_id requerido para matrícula');
      }
      if (seccion === undefined || seccion === null || Number(seccion) <= 0) {
        throw new Error('seccion_id requerido para matrícula');
      }
    }
    return true;
  }),

  // =========================
  // HANDLER
  // =========================
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        alumno_nombre,
        alumno_apellido,
        alumno_correo,
        alumno_telefono,
        alumno_residencia,
        alumno_genero_id,
        alumno_dpi,
        alumno_fecha_nacimiento,
        alumno_nit,

        codigo_alumno,
        estado_alumno_id,

        enc_nombre,
        enc_apellido,

        crear_matricula,
        grado_id,
        seccion_id
      } = req.body;

      const call = `
        CALL sp_alumno_crear_con_encargado(
          :p_alumno_nombre,
          :p_alumno_apellido,
          :p_alumno_correo,
          :p_alumno_telefono,
          :p_alumno_residencia,
          :p_alumno_genero_id,
          :p_alumno_dpi,
          :p_alumno_fecha_nacimiento,
          :p_alumno_nit,

          :p_codigo_alumno,
          :p_estado_alumno_id,

          :p_enc_nombre,
          :p_enc_apellido,

          :p_crear_matricula,
          :p_grado_id,
          :p_seccion_id
        );
      `;

      const rows = await sequelize.query(call, {
        replacements: {
          p_alumno_nombre: alumno_nombre.trim(),
          p_alumno_apellido: alumno_apellido.trim(),
          p_alumno_correo: alumno_correo.trim(),
          p_alumno_telefono: alumno_telefono.trim(),
          p_alumno_residencia: alumno_residencia.trim(),
          p_alumno_genero_id: alumno_genero_id ?? null,
          p_alumno_dpi: alumno_dpi.trim(),
          p_alumno_fecha_nacimiento: alumno_fecha_nacimiento,
          p_alumno_nit: alumno_nit.trim(),

          p_codigo_alumno: codigo_alumno.trim(),
          p_estado_alumno_id: Number(estado_alumno_id),

          p_enc_nombre: enc_nombre.trim(),
          p_enc_apellido: enc_apellido.trim(),

          p_crear_matricula: Number(crear_matricula),
          p_grado_id: Number(crear_matricula) === 1 ? Number(grado_id) : null,
          p_seccion_id: Number(crear_matricula) === 1 ? Number(seccion_id) : null
        }
      });

      return res.status(201).json({
        message: 'Alumno creado y asignado a encargado correctamente',
        data: Array.isArray(rows) ? rows : []
      });
    } catch (error) {
      const msg = (error?.message || '').toLowerCase();
      if (
        msg.includes('requerido') ||
        msg.includes('inválido') ||
        msg.includes('inexistente') ||
        msg.includes('ya existe') ||
        msg.includes('no existe encargado') ||
        msg.includes('múltiples encargados') ||
        msg.includes('no hay ciclo_escolar')
      ) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.actualizarAlumnoConEncargado = [
  // -------- dato de búsqueda --------
  body('codigo_alumno_busqueda')
    .exists().withMessage('codigo_alumno_busqueda requerido')
    .bail()
    .isString().withMessage('codigo_alumno_busqueda debe ser texto')
    .trim()
    .notEmpty().withMessage('codigo_alumno_busqueda requerido')
    .isLength({ max: 20 }).withMessage('codigo_alumno_busqueda máximo 20 caracteres'),

  // -------- persona alumno --------
  body('alumno_nombre')
    .exists().withMessage('alumno_nombre requerido')
    .bail()
    .isString().withMessage('alumno_nombre debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_nombre requerido')
    .isLength({ max: 50 }).withMessage('alumno_nombre máximo 50 caracteres'),

  body('alumno_apellido')
    .exists().withMessage('alumno_apellido requerido')
    .bail()
    .isString().withMessage('alumno_apellido debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_apellido requerido')
    .isLength({ max: 50 }).withMessage('alumno_apellido máximo 50 caracteres'),

  body('alumno_correo')
    .exists().withMessage('alumno_correo requerido')
    .bail()
    .isEmail().withMessage('alumno_correo inválido')
    .trim()
    .isLength({ max: 100 }).withMessage('alumno_correo máximo 100 caracteres'),

  body('alumno_telefono')
    .exists().withMessage('alumno_telefono requerido')
    .bail()
    .isString().withMessage('alumno_telefono debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_telefono requerido')
    .isLength({ max: 20 }).withMessage('alumno_telefono máximo 20 caracteres'),

  body('alumno_residencia')
    .exists().withMessage('alumno_residencia requerida')
    .bail()
    .isString().withMessage('alumno_residencia debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_residencia requerida')
    .isLength({ max: 255 }).withMessage('alumno_residencia máximo 255 caracteres'),

  body('alumno_genero_id')
    .optional({ nullable: true })
    .isString().withMessage('alumno_genero_id debe ser texto')
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('alumno_genero_id debe tener 1 carácter'),

  body('alumno_dpi_nuevo')
    .exists().withMessage('alumno_dpi_nuevo requerido')
    .bail()
    .isString().withMessage('alumno_dpi_nuevo debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_dpi_nuevo requerido')
    .isLength({ max: 20 }).withMessage('alumno_dpi_nuevo máximo 20 caracteres'),

  body('alumno_fecha_nacimiento')
    .exists().withMessage('alumno_fecha_nacimiento requerido')
    .bail()
    .isISO8601().withMessage('alumno_fecha_nacimiento debe ser fecha válida (YYYY-MM-DD)'),

  body('alumno_nit')
    .exists().withMessage('alumno_nit requerido')
    .bail()
    .isString().withMessage('alumno_nit debe ser texto')
    .trim()
    .notEmpty().withMessage('alumno_nit requerido')
    .isLength({ max: 15 }).withMessage('alumno_nit máximo 15 caracteres'),

  // -------- alumno --------
  body('codigo_alumno_nuevo')
    .exists().withMessage('codigo_alumno_nuevo requerido')
    .bail()
    .isString().withMessage('codigo_alumno_nuevo debe ser texto')
    .trim()
    .notEmpty().withMessage('codigo_alumno_nuevo requerido')
    .isLength({ max: 20 }).withMessage('codigo_alumno_nuevo máximo 20 caracteres'),

  body('estado_alumno_id')
    .exists().withMessage('estado_alumno_id requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('estado_alumno_id debe ser entero > 0'),

  body('estado_alumno_reg')
    .exists().withMessage('estado_alumno_reg requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('estado_alumno_reg debe ser 0 o 1'),

  // -------- encargado existente --------
  body('enc_nombre')
    .exists().withMessage('enc_nombre requerido')
    .bail()
    .isString().withMessage('enc_nombre debe ser texto')
    .trim()
    .notEmpty().withMessage('enc_nombre requerido')
    .isLength({ max: 50 }).withMessage('enc_nombre máximo 50 caracteres'),

  body('enc_apellido')
    .exists().withMessage('enc_apellido requerido')
    .bail()
    .isString().withMessage('enc_apellido debe ser texto')
    .trim()
    .notEmpty().withMessage('enc_apellido requerido')
    .isLength({ max: 50 }).withMessage('enc_apellido máximo 50 caracteres'),

  // -------- matrícula opcional --------
  body('crear_matricula')
    .exists().withMessage('crear_matricula requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('crear_matricula debe ser 0 o 1'),

  body('grado_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  // -------- validación cruzada --------
  body().custom((_, { req }) => {
    const crearMatricula = Number(req.body.crear_matricula);

    if (crearMatricula === 1) {
      if (req.body.grado_id == null || req.body.grado_id === '' || Number(req.body.grado_id) <= 0) {
        throw new Error('grado_id requerido para matrícula');
      }
      if (req.body.seccion_id == null || req.body.seccion_id === '' || Number(req.body.seccion_id) <= 0) {
        throw new Error('seccion_id requerido para matrícula');
      }
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const codigo_alumno_busqueda = req.body.codigo_alumno_busqueda.toString().trim();

      const alumno_nombre = req.body.alumno_nombre.toString().trim();
      const alumno_apellido = req.body.alumno_apellido.toString().trim();
      const alumno_correo = req.body.alumno_correo.toString().trim();
      const alumno_telefono = req.body.alumno_telefono.toString().trim();
      const alumno_residencia = req.body.alumno_residencia.toString().trim();

      const alumno_genero_id =
        req.body.alumno_genero_id == null || req.body.alumno_genero_id === ''
          ? null
          : req.body.alumno_genero_id.toString().trim();

      const alumno_dpi_nuevo = req.body.alumno_dpi_nuevo.toString().trim();
      const alumno_fecha_nacimiento = req.body.alumno_fecha_nacimiento;
      const alumno_nit = req.body.alumno_nit.toString().trim();

      const codigo_alumno_nuevo = req.body.codigo_alumno_nuevo.toString().trim();
      const estado_alumno_id = Number(req.body.estado_alumno_id);
      const estado_alumno_reg = Number(req.body.estado_alumno_reg);

      const enc_nombre = req.body.enc_nombre.toString().trim();
      const enc_apellido = req.body.enc_apellido.toString().trim();

      const crear_matricula = Number(req.body.crear_matricula);
      const grado_id = crear_matricula === 1 ? Number(req.body.grado_id) : null;
      const seccion_id = crear_matricula === 1 ? Number(req.body.seccion_id) : null;

      const raw = await sequelize.query(
        `CALL sp_alumno_actualizar_con_encargado(
          :codigoAlumnoBusqueda,
          :alumnoNombre,
          :alumnoApellido,
          :alumnoCorreo,
          :alumnoTelefono,
          :alumnoResidencia,
          :alumnoGenero,
          :alumnoDpiNuevo,
          :alumnoFechaNacimiento,
          :alumnoNit,
          :codigoAlumnoNuevo,
          :estadoAlumnoId,
          :estadoAlumnoReg,
          :encNombre,
          :encApellido,
          :crearMatricula,
          :gradoId,
          :seccionId
        );`,
        {
          replacements: {
            codigoAlumnoBusqueda: codigo_alumno_busqueda,
            alumnoNombre: alumno_nombre,
            alumnoApellido: alumno_apellido,
            alumnoCorreo: alumno_correo,
            alumnoTelefono: alumno_telefono,
            alumnoResidencia: alumno_residencia,
            alumnoGenero: alumno_genero_id,
            alumnoDpiNuevo: alumno_dpi_nuevo,
            alumnoFechaNacimiento: alumno_fecha_nacimiento,
            alumnoNit: alumno_nit,
            codigoAlumnoNuevo: codigo_alumno_nuevo,
            estadoAlumnoId: estado_alumno_id,
            estadoAlumnoReg: estado_alumno_reg,
            encNombre: enc_nombre,
            encApellido: enc_apellido,
            crearMatricula: crear_matricula,
            gradoId: grado_id,
            seccionId: seccion_id
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Alumno actualizado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = error && error.message ? String(error.message) : 'Error interno';

      if (
        /requerid/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg) ||
        /debe ser 0 o 1/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe alumno/i.test(msg) ||
        /no existe encargado/i.test(msg) ||
        /múltiples encargados/i.test(msg) ||
        /multiples encargados/i.test(msg) ||
        /inexistente/i.test(msg) ||
        /inactivo/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /ya existe/i.test(msg) ||
        /no se pudo resolver encargado_id/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];