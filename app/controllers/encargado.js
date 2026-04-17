/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Encargado = require('../models/Encargado');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Encargado.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.buscarEncargadosConAlumnos = [

  body('dpi_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('dpi_encargado máximo 20 caracteres'),

  body('nombre_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('nombre_encargado máximo 100 caracteres'),

  body('telefono_encargado')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('telefono_encargado máximo 20 caracteres'),

  body('codigo_alumno')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 }).withMessage('codigo_alumno máximo 20 caracteres'),

  body('nombre_alumno')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 }).withMessage('nombre_alumno máximo 100 caracteres'),

  body('grado_id')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('grado_id debe ser entero > 0'),

  body('seccion_id')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ gt: 0 }).withMessage('seccion_id debe ser entero > 0'),

  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {

      const {
        dpi_encargado = null,
        nombre_encargado = null,
        telefono_encargado = null,
        codigo_alumno = null,
        nombre_alumno = null,
        grado_id = null,
        seccion_id = null
      } = req.body;

      const raw = await sequelize.query(
        `CALL sp_buscar_encargados_alumnos(
          :dpi,
          :nombreEnc,
          :telefono,
          :codigoAl,
          :nombreAl,
          :grado,
          :seccion
        );`,
        {
          replacements: {
            dpi: dpi_encargado || null,
            nombreEnc: nombre_encargado || null,
            telefono: telefono_encargado || null,
            codigoAl: codigo_alumno || null,
            nombreAl: nombre_alumno || null,
            grado: grado_id || null,
            seccion: seccion_id || null
          }
        }
      );

      // Normalización del result set
      let rows = [];
      if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) rows = raw[0];
        else rows = raw;
      } else if (raw && typeof raw === 'object') {
        rows = [raw];
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          error: 'No se encontraron resultados con los filtros proporcionados'
        });
      }

      const encargadosMap = new Map();

      for (const r of rows) {

        if (!encargadosMap.has(r.encargado_id)) {
          encargadosMap.set(r.encargado_id, {
            encargado_id: r.encargado_id,
            nombre: r.nombre_encargado,
            apellido: r.apellido_encargado,
            dpi: r.dpi_encargado,
            nit: r.nit,
            fecha_nacimiento: r.fecha_nacimiento,
            genero_id: r.genero_id,
            telefono: r.telefono,
            correo: r.correo,
            residencia: r.residencia,
            alumnos: []
          });
        }

        const encargado = encargadosMap.get(r.encargado_id);

        encargado.alumnos.push({
          alumno_id: r.alumno_id,
          codigo_alumno: r.codigo_alumno,
          nombre: r.nombre_alumno,
          apellido: r.apellido_alumno,
          estado_alumno: r.estado_alumno,
          grado: r.grado_des,
          seccion: r.seccion_des
        });
      }

      const data = Array.from(encargadosMap.values());

      return res.status(200).json({ total_encargados: data.length, data });

    } catch (error) {

      const msg = error?.message || 'Error interno';

      if (/Error al ejecutar el procedimiento/i.test(msg)) {
        return res.status(500).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.crearEncargado = [
  
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

  // -------- Encargado --------
  body('estado_encargado')
    .exists().withMessage('estado_encargado requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('estado_encargado debe ser 0 o 1'),

  // -------- Alumnos --------
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
      const nombre = req.body.nombre.toString().trim();
      const apellido = req.body.apellido.toString().trim();
      const correo = req.body.correo.toString().trim();
      const telefono = req.body.telefono.toString().trim();
      const residencia = req.body.residencia.toString().trim();

      const genero_id =
        req.body.genero_id == null || req.body.genero_id === ''
          ? null
          : req.body.genero_id.toString().trim();

      const dpi = req.body.dpi.toString().trim();
      const fecha_nacimiento = req.body.fecha_nacimiento;
      const nit = req.body.nit.toString().trim();
      const estado_encargado = Number(req.body.estado_encargado);

      // arreglo de ids únicos
      const alumnos =
        Array.isArray(req.body.alumnos)
          ? [...new Set(req.body.alumnos.map(x => Number(x)).filter(x => Number.isInteger(x) && x > 0))]
          : [];

      const alumnos_json = JSON.stringify(alumnos);

      const raw = await sequelize.query(
        `CALL sp_encargado_crear(
          :nombre,
          :apellido,
          :correo,
          :telefono,
          :residencia,
          :genero,
          :dpi,
          :fechaNacimiento,
          :nit,
          :estadoEncargado,
          :alumnosJson
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
            estadoEncargado: estado_encargado,
            alumnosJson: alumnos_json
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(201).json({
        message: 'Encargado creado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = error && error.message ? String(error.message) : 'Error interno';

      if (
        /requerid/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /debe ser 0 o 1/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (/inexistente/i.test(msg)) {
        return res.status(404).json({ error: msg });
      }

      if (/ya existe/i.test(msg) || /no existen o están inactivos/i.test(msg) || /no existen o estan inactivos/i.test(msg)) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.actualizarEncargado = [
  // -------- dato de búsqueda --------
  body('dpi_busqueda')
    .exists().withMessage('dpi_busqueda requerido')
    .bail()
    .isString().withMessage('dpi_busqueda debe ser texto')
    .trim()
    .notEmpty().withMessage('dpi_busqueda requerido')
    .isLength({ max: 20 }).withMessage('dpi_busqueda máximo 20 caracteres'),

  // -------- Persona --------
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

  // -------- Encargado --------
  body('estado_encargado')
    .exists().withMessage('estado_encargado requerido')
    .bail()
    .toInt()
    .isInt({ min: 0, max: 1 }).withMessage('estado_encargado debe ser 0 o 1'),

  // -------- Alumnos nuevos --------
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
      const estado_encargado = Number(req.body.estado_encargado);

      // alumnos nuevos que quedarán asignados
      const alumnos =
        Array.isArray(req.body.alumnos)
          ? [...new Set(req.body.alumnos.map(x => Number(x)).filter(x => Number.isInteger(x) && x > 0))]
          : [];

      const alumnos_json = JSON.stringify(alumnos);

      const raw = await sequelize.query(
        `CALL sp_encargado_actualizar_completo(
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
          :estadoEncargado,
          :alumnosJson
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
            estadoEncargado: estado_encargado,
            alumnosJson: alumnos_json
          }
        }
      );

      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Encargado actualizado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = error && error.message ? String(error.message) : 'Error interno';

      if (
        /requerid/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg) ||
        /json válido/i.test(msg) ||
        /json valido/i.test(msg) ||
        /debe ser 0 o 1/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe encargado/i.test(msg) ||
        /placeholder/i.test(msg) ||
        /inexistente/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /ya existe/i.test(msg) ||
        /otro registro/i.test(msg) ||
        /no existen o están inactivos/i.test(msg) ||
        /no existen o estan inactivos/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];

exports.eliminarEncargado = [
  // -------- obligatorio --------
  body('dpi')
    .exists().withMessage('dpi requerido')
    .bail()
    .isString().withMessage('dpi debe ser texto')
    .trim()
    .notEmpty().withMessage('dpi requerido')
    .isLength({ max: 20 }).withMessage('dpi máximo 20 caracteres'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const dpi = req.body.dpi.toString().trim();

      const raw = await sequelize.query(
        `CALL sp_encargado_eliminacion(:p_dpi);`,
        {
          replacements: {
            p_dpi: dpi
          }
        }
      );

      // Normalización robusta para MySQL CALL
      let rows = [];
      if (Array.isArray(raw)) rows = Array.isArray(raw[0]) ? raw[0] : raw;
      else if (raw && typeof raw === 'object') rows = [raw];

      return res.status(200).json({
        message: 'Encargado desactivado correctamente',
        data: rows || []
      });
    } catch (error) {
      const msg = (error && error.message) ? String(error.message) : 'Error interno';

      if (
        /dpi requerido/i.test(msg) ||
        /inválid/i.test(msg) ||
        /invalido/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }

      if (
        /no existe encargado con el dpi proporcionado/i.test(msg) ||
        /no existe encargado placeholder/i.test(msg)
      ) {
        return res.status(404).json({ error: msg });
      }

      if (
        /no se puede eliminar el encargado placeholder/i.test(msg)
      ) {
        return res.status(409).json({ error: msg });
      }

      return res.status(500).json({ error: msg });
    }
  }
];