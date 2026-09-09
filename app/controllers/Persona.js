/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Persona = require('../models/Persona');
const sequelize = require('../../config/dbconfig');
const bcrypt = require('bcrypt');

exports.buscarMaestros = [
  // -------- obligatorios --------
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

  // -------- opcionales (maestro) --------
  body('codigo_empleado')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_empleado debe ser entero > 0'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  body('escalafon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  body('nombre_maestro')
    .optional({ nullable: true })
    .isString().withMessage('nombre_maestro debe ser texto')
    .trim()
    .isLength({ max: 120 }).withMessage('nombre_maestro máximo 120 caracteres'),

  body('dpi_maestro')
    .optional({ nullable: true })
    .isString().withMessage('dpi_maestro debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('dpi_maestro máximo 20 caracteres'),

  // -------- opcionales (donde imparte) --------
  body('grado_imparte_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_imparte_id debe ser entero > 0'),

  body('seccion_imparte_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_imparte_id debe ser entero > 0'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const anio = Number(req.body.anio);
      const grado_id = Number(req.body.grado_id);
      const seccion_id = Number(req.body.seccion_id);

      // opcionales: mandar NULL si vienen vacíos
      const codigo_empleado =
        req.body.codigo_empleado === '' || req.body.codigo_empleado == null
          ? null
          : Number(req.body.codigo_empleado);

      const renglon_id =
        req.body.renglon_id === '' || req.body.renglon_id == null
          ? null
          : Number(req.body.renglon_id);

      const escalafon_id =
        req.body.escalafon_id === '' || req.body.escalafon_id == null
          ? null
          : Number(req.body.escalafon_id);

      const nombre_maestro = (req.body.nombre_maestro ?? '').toString().trim();
      const dpi_maestro = (req.body.dpi_maestro ?? '').toString().trim();

      const grado_imparte_id =
        req.body.grado_imparte_id === '' || req.body.grado_imparte_id == null
          ? null
          : Number(req.body.grado_imparte_id);

      const seccion_imparte_id =
        req.body.seccion_imparte_id === '' || req.body.seccion_imparte_id == null
          ? null
          : Number(req.body.seccion_imparte_id);

      const raw = await sequelize.query(
        'CALL sp_buscar_maestros(:anio,:grado,:seccion,:codEmp,:renglon,:escalafon,:nom,:dpi,:gradoImp,:seccionImp);',
        {
          replacements: {
            anio,
            grado: grado_id,
            seccion: seccion_id,

            codEmp: codigo_empleado,
            renglon: renglon_id,
            escalafon: escalafon_id,
            nom: nombre_maestro.length ? nombre_maestro : null,
            dpi: dpi_maestro.length ? dpi_maestro : null,
            gradoImp: grado_imparte_id,
            seccionImp: seccion_imparte_id
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      // Búsqueda: 0 filas no es error
      return res.status(200).json({ data: rows || [] });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      // SIGNAL del SP -> 400 / 404
      if (/parámetro inválido/i.test(msg) || /parametro inválido/i.test(msg) || /inválido/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.crearMaestro = [
  // -------- obligatorios Persona --------
  body('nombre')
    .exists().withMessage('nombre requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre requerido')
    .isLength({ max: 50 }).withMessage('nombre máximo 50 caracteres'),

  body('apellido')
    .exists().withMessage('apellido requerido')
    .bail()
    .isString().withMessage('apellido debe ser texto')
    .trim()
    .notEmpty().withMessage('apellido requerido')
    .isLength({ max: 50 }).withMessage('apellido máximo 50 caracteres'),

  body('correo')
    .exists().withMessage('correo requerido')
    .bail()
    .isEmail().withMessage('correo inválido')
    .trim()
    .isLength({ max: 100 }).withMessage('correo máximo 100 caracteres'),

  body('telefono')
    .exists().withMessage('telefono requerido')
    .bail()
    .isString().withMessage('telefono debe ser texto')
    .trim()
    .notEmpty().withMessage('telefono requerido')
    .isLength({ max: 20 }).withMessage('telefono máximo 20 caracteres'),

  body('residencia')
    .exists().withMessage('residencia requerida')
    .bail()
    .isString().withMessage('residencia debe ser texto')
    .trim()
    .notEmpty().withMessage('residencia requerida')
    .isLength({ max: 255 }).withMessage('residencia máximo 255 caracteres'),

  body('genero_id')
    .optional({ nullable: true })
    .isString().withMessage('genero_id debe ser texto')
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('genero_id debe tener 1 carácter'),

  body('dpi')
    .exists().withMessage('dpi requerido')
    .bail()
    .isString().withMessage('dpi debe ser texto')
    .trim()
    .notEmpty().withMessage('dpi requerido')
    .isLength({ max: 20 }).withMessage('dpi máximo 20 caracteres'),

  body('fecha_nacimiento')
    .exists().withMessage('fecha_nacimiento requerida')
    .bail()
    .isISO8601().withMessage('fecha_nacimiento debe ser fecha válida (YYYY-MM-DD)'),

  body('nit')
    .exists().withMessage('nit requerido')
    .bail()
    .isString().withMessage('nit debe ser texto')
    .trim()
    .notEmpty().withMessage('nit requerido')
    .isLength({ max: 15 }).withMessage('nit máximo 15 caracteres'),

  // -------- obligatorios Usuario/Maestro --------
  body('nombre_usuario')
    .exists().withMessage('nombre_usuario requerido')
    .bail()
    .isString().withMessage('nombre_usuario debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_usuario requerido')
    .isLength({ max: 50 }).withMessage('nombre_usuario máximo 50 caracteres'),

  body('codigo_empleado')
    .exists().withMessage('codigo_empleado requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_empleado debe ser entero > 0'),

  body('cedula_docente')
    .exists().withMessage('cedula_docente requerida')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('cedula_docente debe ser entero > 0'),

  body('fecha_inicio_labores')
    .exists().withMessage('fecha_inicio_labores requerida')
    .bail()
    .isISO8601().withMessage('fecha_inicio_labores debe ser fecha válida (YYYY-MM-DD)'),

  // -------- opcionales Usuario/Maestro --------
  body('escalafon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  body('codigo_institucional')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_institucional debe ser entero > 0'),

  // -------- asignación opcional --------
  body('asignar_clase')
    .exists().withMessage('asignar_clase requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('asignar_clase debe ser 0 o 1'),

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
    const asignar = Number(req.body.asignar_clase);

    if (asignar === 1) {
      if (req.body.grado_id == null || req.body.grado_id === '' || Number(req.body.grado_id) <= 0) {
        throw new Error('grado_id requerido para asignación');
      }
      if (req.body.seccion_id == null || req.body.seccion_id === '' || Number(req.body.seccion_id) <= 0) {
        throw new Error('seccion_id requerido para asignación');
      }
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const nombre = req.body.nombre.toString().trim();
      const apellido = req.body.apellido.toString().trim();
      const correo = req.body.correo.toString().trim();
      const telefono = req.body.telefono.toString().trim();
      const residencia = req.body.residencia.toString().trim();
      const genero_id = req.body.genero_id == null || req.body.genero_id === ''
        ? null
        : req.body.genero_id.toString().trim();

      const dpi = req.body.dpi.toString().trim();
      const fecha_nacimiento = req.body.fecha_nacimiento;
      const nit = req.body.nit.toString().trim();

      const nombre_usuario = req.body.nombre_usuario.toString().trim();
      const contrasena = "EORM$2026"; // Contraseña por defecto, se recomienda cambiar en primer inicio
      const codigo_empleado = Number(req.body.codigo_empleado);
      const cedula_docente = Number(req.body.cedula_docente);
      const fecha_inicio_labores = req.body.fecha_inicio_labores;

      const escalafon_id =
        req.body.escalafon_id === '' || req.body.escalafon_id == null
          ? null
          : Number(req.body.escalafon_id);

      const renglon_id =
        req.body.renglon_id === '' || req.body.renglon_id == null
          ? null
          : Number(req.body.renglon_id);

      const codigo_institucional =
        req.body.codigo_institucional === '' || req.body.codigo_institucional == null
          ? null
          : Number(req.body.codigo_institucional);

      const estado_usuario = 1; // Activo por defecto
      const asignar_clase = Number(req.body.asignar_clase);

      const grado_id =
        asignar_clase === 1
          ? Number(req.body.grado_id)
          : null;

      const seccion_id =
        asignar_clase === 1
          ? Number(req.body.seccion_id)
          : null;

      // Hash en la API, porque sequelize.query/CALL no dispara hooks del modelo
      const salt = await bcrypt.genSalt(10);
      const hash_contrasena = await bcrypt.hash(contrasena, salt);

      const raw = await sequelize.query(
        `CALL sp_maestro_crear(
          :nombre,
          :apellido,
          :correo,
          :telefono,
          :residencia,
          :genero,
          :dpi,
          :fechaNacimiento,
          :nit,
          :nombreUsuario,
          :hashContrasena,
          :codigoEmpleado,
          :cedulaDocente,
          :fechaInicioLabores,
          :escalafon,
          :renglon,
          :codigoInstitucional,
          :estadoUsuario,
          :asignarClase,
          :grado,
          :seccion
        );`,
        {
          replacements: {
            nombre,
            apellido,
            correo,
            telefono,
            residencia,
            genero: genero_id,
            dpi,
            fechaNacimiento: fecha_nacimiento,
            nit,
            nombreUsuario: nombre_usuario,
            hashContrasena: hash_contrasena,
            codigoEmpleado: codigo_empleado,
            cedulaDocente: cedula_docente,
            fechaInicioLabores: fecha_inicio_labores,
            escalafon: escalafon_id,
            renglon: renglon_id,
            codigoInstitucional: codigo_institucional,
            estadoUsuario: estado_usuario,
            asignarClase: asignar_clase,
            grado: grado_id,
            seccion: seccion_id
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(201).json({
        message: 'Maestro creado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (/requerid/i.test(msg) || /inválid/i.test(msg) || /invalido/i.test(msg)) {
        return res.status(400).json({ error: msg });
      }
      if (/inexistente/i.test(msg) || /inactivo/i.test(msg) || /no existe/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }
      if (/ya existe/i.test(msg) || /ya está asignado/i.test(msg) || /ya esta asignado/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarMaestro = [
  // -------- dato de búsqueda --------
  body('dpi_busqueda')
    .exists().withMessage('dpi_busqueda requerido')
    .bail()
    .isString().withMessage('dpi_busqueda debe ser texto')
    .trim()
    .notEmpty().withMessage('dpi_busqueda requerido')
    .isLength({ max: 20 }).withMessage('dpi_busqueda máximo 20 caracteres'),

  // -------- obligatorios Persona --------
  body('nombre')
    .exists().withMessage('nombre requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre requerido')
    .isLength({ max: 50 }).withMessage('nombre máximo 50 caracteres'),

  body('apellido')
    .exists().withMessage('apellido requerido')
    .bail()
    .isString().withMessage('apellido debe ser texto')
    .trim()
    .notEmpty().withMessage('apellido requerido')
    .isLength({ max: 50 }).withMessage('apellido máximo 50 caracteres'),

  body('correo')
    .exists().withMessage('correo requerido')
    .bail()
    .isEmail().withMessage('correo inválido')
    .trim()
    .isLength({ max: 100 }).withMessage('correo máximo 100 caracteres'),

  body('telefono')
    .exists().withMessage('telefono requerido')
    .bail()
    .isString().withMessage('telefono debe ser texto')
    .trim()
    .notEmpty().withMessage('telefono requerido')
    .isLength({ max: 20 }).withMessage('telefono máximo 20 caracteres'),

  body('residencia')
    .exists().withMessage('residencia requerida')
    .bail()
    .isString().withMessage('residencia debe ser texto')
    .trim()
    .notEmpty().withMessage('residencia requerida')
    .isLength({ max: 255 }).withMessage('residencia máximo 255 caracteres'),

  body('genero_id')
    .optional({ nullable: true })
    .isString().withMessage('genero_id debe ser texto')
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('genero_id debe tener 1 carácter'),

  body('dpi_nuevo')
    .exists().withMessage('dpi_nuevo requerido')
    .bail()
    .isString().withMessage('dpi_nuevo debe ser texto')
    .trim()
    .notEmpty().withMessage('dpi_nuevo requerido')
    .isLength({ max: 20 }).withMessage('dpi_nuevo máximo 20 caracteres'),

  body('fecha_nacimiento')
    .exists().withMessage('fecha_nacimiento requerida')
    .bail()
    .isISO8601().withMessage('fecha_nacimiento debe ser fecha válida (YYYY-MM-DD)'),

  body('nit')
    .exists().withMessage('nit requerido')
    .bail()
    .isString().withMessage('nit debe ser texto')
    .trim()
    .notEmpty().withMessage('nit requerido')
    .isLength({ max: 15 }).withMessage('nit máximo 15 caracteres'),

  // -------- obligatorios Usuario/Maestro --------
  body('nombre_usuario')
    .exists().withMessage('nombre_usuario requerido')
    .bail()
    .isString().withMessage('nombre_usuario debe ser texto')
    .trim()
    .notEmpty().withMessage('nombre_usuario requerido')
    .isLength({ max: 50 }).withMessage('nombre_usuario máximo 50 caracteres'),

  body('codigo_empleado')
    .exists().withMessage('codigo_empleado requerido')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_empleado debe ser entero > 0'),

  body('cedula_docente')
    .exists().withMessage('cedula_docente requerida')
    .bail()
    .toInt()
    .isInt({ gt: 0 }).withMessage('cedula_docente debe ser entero > 0'),

  body('fecha_inicio_labores')
    .exists().withMessage('fecha_inicio_labores requerida')
    .bail()
    .isISO8601().withMessage('fecha_inicio_labores debe ser fecha válida (YYYY-MM-DD)'),

  // -------- opcionales Usuario/Maestro --------
  body('escalafon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('escalafon_id debe ser entero > 0'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('renglon_id debe ser entero > 0'),

  body('codigo_institucional')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_institucional debe ser entero > 0'),

  // -------- asignación opcional --------
  body('asignar_clase')
    .exists().withMessage('asignar_clase requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('asignar_clase debe ser 0 o 1'),

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
    const asignar = Number(req.body.asignar_clase);

    if (asignar === 1) {
      if (req.body.grado_id == null || req.body.grado_id === '' || Number(req.body.grado_id) <= 0) {
        throw new Error('grado_id requerido para asignación');
      }
      if (req.body.seccion_id == null || req.body.seccion_id === '' || Number(req.body.seccion_id) <= 0) {
        throw new Error('seccion_id requerido para asignación');
      }
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const dpi_busqueda = req.body.dpi_busqueda.toString().trim();

      const nombre = req.body.nombre.toString().trim();
      const apellido = req.body.apellido.toString().trim();
      const correo = req.body.correo.toString().trim();
      const telefono = req.body.telefono.toString().trim();
      const residencia = req.body.residencia.toString().trim();

      const genero_id =
        req.body.genero_id == null || req.body.genero_id === ''
          ? null
          : req.body.genero_id.toString().trim();

      const dpi_nuevo = req.body.dpi_nuevo.toString().trim();
      const fecha_nacimiento = req.body.fecha_nacimiento;
      const nit = req.body.nit.toString().trim();

      const nombre_usuario = req.body.nombre_usuario.toString().trim();
      const contrasena = "EORM$2026"; // Contraseña por defecto, se recomienda cambiar en primer inicio

      const codigo_empleado = Number(req.body.codigo_empleado);
      const cedula_docente = Number(req.body.cedula_docente);
      const fecha_inicio_labores = req.body.fecha_inicio_labores;

      const escalafon_id =
        req.body.escalafon_id === '' || req.body.escalafon_id == null
          ? null
          : Number(req.body.escalafon_id);

      const renglon_id =
        req.body.renglon_id === '' || req.body.renglon_id == null
          ? null
          : Number(req.body.renglon_id);

      const codigo_institucional =
        req.body.codigo_institucional === '' || req.body.codigo_institucional == null
          ? null
          : Number(req.body.codigo_institucional);

      const estado_usuario = 1; // Activo por defecto
      const asignar_clase = Number(req.body.asignar_clase);

      const grado_id = asignar_clase === 1 ? Number(req.body.grado_id) : null;
      const seccion_id = asignar_clase === 1 ? Number(req.body.seccion_id) : null;

      // Hash en la API porque CALL no dispara hooks del modelo
      const salt = await bcrypt.genSalt(10);
      const hash_contrasena = await bcrypt.hash(contrasena, salt);

      const raw = await sequelize.query(
        `CALL sp_maestro_actualizar_completo(
          :dpiBusqueda,
          :nombre,
          :apellido,
          :correo,
          :telefono,
          :residencia,
          :genero,
          :dpiNuevo,
          :fechaNacimiento,
          :nit,
          :nombreUsuario,
          :hashContrasena,
          :codigoEmpleado,
          :cedulaDocente,
          :fechaInicioLabores,
          :escalafon,
          :renglon,
          :codigoInstitucional,
          :estadoUsuario,
          :asignarClase,
          :grado,
          :seccion
        );`,
        {
          replacements: {
            dpiBusqueda: dpi_busqueda,
            nombre,
            apellido,
            correo,
            telefono,
            residencia,
            genero: genero_id,
            dpiNuevo: dpi_nuevo,
            fechaNacimiento: fecha_nacimiento,
            nit,
            nombreUsuario: nombre_usuario,
            hashContrasena: hash_contrasena,
            codigoEmpleado: codigo_empleado,
            cedulaDocente: cedula_docente,
            fechaInicioLabores: fecha_inicio_labores,
            escalafon: escalafon_id,
            renglon: renglon_id,
            codigoInstitucional: codigo_institucional,
            estadoUsuario: estado_usuario,
            asignarClase: asignar_clase,
            grado: grado_id,
            seccion: seccion_id
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Maestro actualizado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /requerid/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg) ||
        /debe ser 0 o 1/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe/i.test(msg) ||
        /inexistente/i.test(msg) ||
        /inactivo/i.test(msg) ||
        /no pertenece a un maestro/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /ya existe/i.test(msg) ||
        /ya está asignado/i.test(msg) ||
        /ya esta asignado/i.test(msg) ||
        /otro registro/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.eliminarMaestro = [
  // -------- opcionales, pero al menos uno requerido --------
  body('dpi')
    .optional({ nullable: true })
    .isString().withMessage('dpi debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('dpi máximo 20 caracteres'),

  body('codigo_empleado')
    .optional({ nullable: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('codigo_empleado debe ser entero > 0'),

  // -------- validación cruzada --------
  body().custom((_, { req }) => {
    const dpi = (req.body.dpi ?? '').toString().trim();
    const codigo = req.body.codigo_empleado;

    if (!dpi && (codigo == null || codigo === '' || Number(codigo) <= 0)) {
      throw new Error('Debe enviar dpi o codigo_empleado');
    }

    return true;
  }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const dpi =
        req.body.dpi == null || req.body.dpi === ''
          ? null
          : req.body.dpi.toString().trim();

      const codigo_empleado =
        req.body.codigo_empleado == null || req.body.codigo_empleado === ''
          ? null
          : Number(req.body.codigo_empleado);

      const raw = await sequelize.query(
        `CALL sp_usuario_eliminacion(
          :p_dpi,
          :p_codigo_empleado
        );`,
        {
          replacements: {
            p_dpi: dpi,
            p_codigo_empleado: codigo_empleado
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Usuario desactivado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /debe enviar/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe/i.test(msg) ||
        /no se pudo resolver/i.test(msg) ||
        /no coincida/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];