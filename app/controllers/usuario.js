/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // (no se usa directo aquí, pero lo dejo si en otro módulo lo requieren)
const Forgot_password = require('../models/autentication-code');
const config = require('../../config/jwt');
const sequelize = require('../../config/dbconfig');
const mailer = require('../../config/nodemailer');
const crypto = require('crypto'); 
require('dotenv').config({});

const ACCESS_EXPIRES_MS = 8 * 60 * 60 * 1000; // 8h cookie
const ACCESS_EXPIRES_STR = '8h';

const cookieOpts = (req) => ({
  httpOnly: true,
  sameSite: 'lax',                         // 'strict' si no navegas entre orígenes
  secure: process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https'),
  path: '/',
  maxAge: ACCESS_EXPIRES_MS
});

/** Helpers **/
const BCRYPT_ROUNDS = 10;

// Normaliza strings: trims, devuelve null si queda vacío
const nz = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') {
    const t = v.trim();
    return t.length ? t : null;
  }
  return v;
};

// Detecta si una cadena "parece" un hash bcrypt ya válido
const seemsBcrypt = (s = '') => /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s);

// Dado plain o hash, retorna un hash listo para persistir
const resolveHash = async (maybePlain) => {
  const val = nz(maybePlain);
  if (!val) return null; // no tocar en PUT si no viene
  if (seemsBcrypt(val)) return val; // ya es bcrypt
  // si llega en claro o algún otro formato => hash nuevo
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(val, salt);
};

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
  try {
    const [data] = await sequelize.query("SELECT * FROM vista_usuario");
    res.send({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postData = [
  // ========== PERSONA ==========
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo válido')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('residencia')
    .trim()
    .notEmpty().withMessage('La residencia es requerida')
    .isLength({ max: 255 }).withMessage('Máximo 255 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('genero_id')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('genero_id debe ser de 1 carácter'),

  body('dpi')
    .trim()
    .notEmpty().withMessage('El DPI es requerido')
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  body('fecha_nacimiento')
    .notEmpty().withMessage('La fecha de nacimiento es requerida')
    .isISO8601().withMessage('fecha_nacimiento debe ser una fecha válida (YYYY-MM-DD)'),

  body('nit')
    .trim()
    .notEmpty().withMessage('El NIT es requerido')
    .isLength({ max: 15 }).withMessage('Máximo 15 caracteres')
    .custom(val => { if (val.includes(';') || val.includes('--')) throw new Error('Caracteres inválidos'); return true; }),

  // ========== USUARIO ==========
  body('rol_id')
    .trim()
    .notEmpty().withMessage('El rol_id es requerido')
    .isLength({ min: 1, max: 1 }).withMessage('rol_id debe ser de 1 carácter'),

  body('nombre_usuario')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('nombre_usuario: máximo 50 caracteres')
    .custom(val => { if (val && (val.includes(';') || val.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  // Recibimos `contrasena` en claro (recomendado) o, opcionalmente, `hash_contrasena`
  body('contrasena')
    .notEmpty().withMessage('contrasena es requerida')
    .isLength({ min: 8, max: 255 }).withMessage('contrasena entre 8 y 255 caracteres'),

  body('hash_contrasena')
    .optional({ nullable: true })
    .isLength({ min: 8, max: 255 }).withMessage('hash_contrasena entre 8 y 255 (si se envía)'),

  body('codigo_empleado')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('codigo_empleado debe ser entero'),

  body('cedula_docente')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('cedula_docente debe ser entero'),

  body('fecha_inicio_lab')
    .optional({ nullable: true })
    .isISO8601().withMessage('fecha_inicio_lab debe ser una fecha válida (YYYY-MM-DD)'),

  body('escalafon_id')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('escalafon_id debe ser entero'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('renglon_id debe ser entero'),

  body('codigo_institucion')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('codigo_institucion debe ser entero'),

  body('estado_usuario')
    .notEmpty().withMessage('estado_usuario es requerido')
    .toInt().isInt({ min: 0, max: 1 }).withMessage('estado_usuario debe ser 0 o 1'),

  // ========== HANDLER ==========
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        nombre,
        apellido,
        email,
        telefono,
        residencia,
        genero_id,
        dpi,
        fecha_nacimiento,
        nit,
        rol_id,
        nombre_usuario,
        contrasena,        // <-- preferido
        hash_contrasena,   // <-- opcional, se normaliza abajo
        codigo_empleado,
        cedula_docente,
        fecha_inicio_lab,
        escalafon_id,
        renglon_id,
        codigo_institucion,
        estado_usuario
      } = req.body;

      // Generar nombre_usuario básico si no viene
      const generatedUsername = nombre_usuario && nombre_usuario.trim().length
        ? nombre_usuario.trim()
        : `${nombre.charAt(0)}${apellido.split(' ')[0]}`
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

      // Resolver hash final (acepta 'contrasena' o 'hash_contrasena')
      const finalHash = await resolveHash(contrasena ?? hash_contrasena);

      const call = `
        CALL sp_usuario_crear_completo(
          :p_nombre,
          :p_apellido,
          :p_correo,
          :p_telefono,
          :p_residencia,
          :p_genero_id,
          :p_dpi,
          :p_fecha_nacimiento,
          :p_nit,

          :p_rol_id,
          :p_nombre_usuario,
          :p_hash_contrasena,
          :p_codigo_empleado,
          :p_cedula_docente,
          :p_fecha_inicio_lab,
          :p_escalafon_id,
          :p_renglon_id,
          :p_codigo_institucion,
          :p_estado_usuario
        );
      `;

      const rows = await sequelize.query(call, {
        replacements: {
          p_nombre: nombre.trim(),
          p_apellido: apellido.trim(),
          p_correo: email.trim(),
          p_telefono: telefono.trim(),
          p_residencia: residencia.trim(),
          p_genero_id: genero_id ?? null,
          p_dpi: dpi.trim(),
          p_fecha_nacimiento: fecha_nacimiento,
          p_nit: nit.trim(),

          p_rol_id: rol_id.trim(),
          p_nombre_usuario: generatedUsername,
          p_hash_contrasena: finalHash, // <-- HASH YA PROCESADO
          p_codigo_empleado: codigo_empleado ?? null,
          p_cedula_docente: cedula_docente ?? null,
          p_fecha_inicio_lab: fecha_inicio_lab ?? null,
          p_escalafon_id: escalafon_id ?? null,
          p_renglon_id: renglon_id ?? null,
          p_codigo_institucion: codigo_institucion ?? null,
          p_estado_usuario: estado_usuario
        }
      });

      return res.status(201).json({
        message: 'Usuario creado correctamente',
        data: Array.isArray(rows) ? rows : []
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

exports.putData = [
  // ========== REQ ==========
  body('usuario_id')
    .toInt()
    .isInt({ min: 1 }).withMessage('usuario_id es requerido y debe ser entero positivo'),

  // ========== PERSONA (opcionales) ==========
  body('nombre')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('nombre no puede ser vacío si se envía')
    .isLength({ max: 50 }).withMessage('nombre: máximo 50 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('apellido')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('apellido no puede ser vacío si se envía')
    .isLength({ max: 50 }).withMessage('apellido: máximo 50 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('email')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('email no puede ser vacío si se envía')
    .isEmail().withMessage('email inválido')
    .isLength({ max: 100 }).withMessage('email: máximo 100 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('telefono')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('telefono no puede ser vacío si se envía')
    .isLength({ max: 20 }).withMessage('telefono: máximo 20 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('residencia')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('residencia no puede ser vacío si se envía')
    .isLength({ max: 255 }).withMessage('residencia: máximo 255 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('genero_id')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('genero_id debe ser de 1 carácter'),

  body('dpi')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('dpi no puede ser vacío si se envía')
    .isLength({ max: 20 }).withMessage('dpi: máximo 20 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  body('fecha_nacimiento')
    .optional({ nullable: true })
    .isISO8601().withMessage('fecha_nacimiento debe ser una fecha válida (YYYY-MM-DD)'),

  body('nit')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('nit no puede ser vacío si se envía')
    .isLength({ max: 15 }).withMessage('nit: máximo 15 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  // ========== USUARIO (opcionales) ==========
  body('rol_id')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('rol_id debe ser de 1 carácter'),

  body('nombre_usuario')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('nombre_usuario no puede ser vacío si se envía')
    .isLength({ max: 50 }).withMessage('nombre_usuario: máximo 50 caracteres')
    .custom(v => { if (v && (v.includes(';') || v.includes('--'))) throw new Error('Caracteres inválidos'); return true; }),

  // Recibimos `contrasena` opcional o `hash_contrasena` opcional
  body('contrasena')
    .optional({ nullable: true })
    .isLength({ min: 8, max: 255 }).withMessage('contrasena entre 8 y 255 (si se envía)'),

  body('hash_contrasena')
    .optional({ nullable: true })
    .isLength({ min: 8, max: 255 }).withMessage('hash_contrasena entre 8 y 255 (si se envía)'),

  body('codigo_empleado')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('codigo_empleado debe ser entero'),

  body('cedula_docente')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('cedula_docente debe ser entero'),

  body('fecha_inicio_lab')
    .optional({ nullable: true })
    .isISO8601().withMessage('fecha_inicio_lab debe ser fecha válida (YYYY-MM-DD)'),

  body('escalafon_id')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('escalafon_id debe ser entero'),

  body('renglon_id')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('renglon_id debe ser entero'),

  body('codigo_institucion')
    .optional({ nullable: true })
    .toInt().isInt().withMessage('codigo_institucion debe ser entero'),

  body('estado_usuario')
    .optional({ nullable: true })
    .toInt().isInt({ min: 0, max: 1 }).withMessage('estado_usuario debe ser 0 o 1'),

  // ========== HANDLER ==========
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        usuario_id,

        // Persona
        nombre,
        apellido,
        email,
        telefono,
        residencia,
        genero_id,
        dpi,
        fecha_nacimiento,
        nit,

        // Usuario
        rol_id,
        nombre_usuario,
        contrasena,        // <-- opcional
        hash_contrasena,   // <-- opcional
        codigo_empleado,
        cedula_docente,
        fecha_inicio_lab,
        escalafon_id,
        renglon_id,
        codigo_institucion,
        estado_usuario
      } = req.body;

      // Resolver hash solo si se envió (mantener NULL si no vino para no tocar DB)
      const finalHash = (contrasena || hash_contrasena)
        ? await resolveHash(contrasena ?? hash_contrasena)
        : null;

      const call = `
        CALL sp_usuario_actualizar_completo(
          :p_usuario_id,

          :p_nombre,
          :p_apellido,
          :p_correo,
          :p_telefono,
          :p_residencia,
          :p_genero_id,
          :p_dpi,
          :p_fecha_nacimiento,
          :p_nit,

          :p_rol_id,
          :p_nombre_usuario,
          :p_hash_contrasena,
          :p_codigo_empleado,
          :p_cedula_docente,
          :p_fecha_inicio_lab,
          :p_escalafon_id,
          :p_renglon_id,
          :p_codigo_institucion,
          :p_estado_usuario
        );
      `;

      const rows = await sequelize.query(call, {
        replacements: {
          p_usuario_id: Number(usuario_id),

          // Persona
          p_nombre: nz(nombre),
          p_apellido: nz(apellido),
          p_correo: nz(email),
          p_telefono: nz(telefono),
          p_residencia: nz(residencia),
          p_genero_id: nz(genero_id),
          p_dpi: nz(dpi),
          p_fecha_nacimiento: nz(fecha_nacimiento),
          p_nit: nz(nit),

          // Usuario
          p_rol_id: nz(rol_id),
          p_nombre_usuario: nz(nombre_usuario),
          p_hash_contrasena: finalHash, // <-- NULL si no se envió; hash si llegó
          p_codigo_empleado: nz(codigo_empleado),
          p_cedula_docente: nz(cedula_docente),
          p_fecha_inicio_lab: nz(fecha_inicio_lab),
          p_escalafon_id: nz(escalafon_id),
          p_renglon_id: nz(renglon_id),
          p_codigo_institucion: nz(codigo_institucion),
          p_estado_usuario: nz(estado_usuario)
        }
      });

      return res.status(200).json({
        message: 'Usuario actualizado correctamente',
        data: Array.isArray(rows) ? rows : []
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];

/**
 * LOGIN
 * - Recibe `identificador` (usuario o correo) y `contrasena` en claro.
 * - Busca el usuario (join Persona) y compara con bcrypt.compare.
 * - Si OK y activo, devuelve la vista pública del usuario.
 */
exports.login = [
  body('identificador').trim().notEmpty().isLength({ max: 100 }),
  body('contrasena').trim().notEmpty().isLength({ min: 8, max: 255 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { identificador, contrasena } = req.body;
      const id = identificador.trim();

      // 1) Buscar por nombre_usuario; si no, por correo
      const [byUser] = await sequelize.query(
        `
        SELECT u.usuario_id, u.hash_contrasena, u.estado AS estado_u, p.estado AS estado_p, u.nombre_usuario, u.rol_id
        FROM Usuario u
        JOIN Persona p ON p.persona_id = u.persona_id
        WHERE u.nombre_usuario = :id
        LIMIT 1
        `,
        { replacements: { id } }
      );

      let row = Array.isArray(byUser) && byUser.length ? byUser[0] : null;

      if (!row) {
        const [byMail] = await sequelize.query(
          `
          SELECT u.usuario_id, u.hash_contrasena, u.estado AS estado_u, p.estado AS estado_p, u.nombre_usuario, u.rol_id
          FROM Usuario u
          JOIN Persona p ON p.persona_id = u.persona_id
          WHERE p.correo = :id
          LIMIT 1
          `,
          { replacements: { id } }
        );
        row = Array.isArray(byMail) && byMail.length ? byMail[0] : null;
      }

      if (!row) return res.status(401).json({ error: 'Credenciales inválidas' });
      if (Number(row.estado_u) !== 1 || Number(row.estado_p) !== 1) {
        return res.status(403).json({ error: 'Usuario inactivo' });
      }

      // 2) Validar contraseña (bcrypt en API)
      const ok = await bcrypt.compare(contrasena, row.hash_contrasena);
      if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

      // 3) Firmar JWT y guardar SOLO en cookie httpOnly (no lo devolvemos en el body)
      const payload = { sub: row.usuario_id, user: row.nombre_usuario, role: row.rol_id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: ACCESS_EXPIRES_STR });
      res.cookie('access_token', token, cookieOpts(req));

      // 4) Traer datos públicos (incluye maestro_*). Si no tienes la vista, ver SQL alterno abajo.
      const [vista] = await sequelize.query(
        `
        SELECT
          u.usuario_id,
          v.rol_id,
          v.persona_nombre,
          v.persona_apellido,
          /* fuerza NULL si no existe valor; para directora vendrá NULL naturalmente */
          v.maestro_anio_actual       AS maestro_anio_actual,
          v.maestro_grado_actual      AS maestro_grado_actual,
          v.maestro_seccion_actual    AS maestro_seccion_actual
        FROM vista_usuario_publico v
        JOIN Usuario u ON u.usuario_id = v.usuario_id
        WHERE v.usuario_id = :id
        LIMIT 1
        `,
        { replacements: { id: row.usuario_id } }
      );

      const data = Array.isArray(vista) && vista.length ? vista[0] : {
        usuario_id: row.usuario_id,
        rol_id: row.rol_id,
        persona_nombre: null,
        persona_apellido: null,
        maestro_anio_actual: null,
        maestro_grado_actual: null,
        maestro_seccion_actual: null
      };

      // 5) Respuesta sin token en el body
      return res.status(200).json({
        message: 'Login exitoso',
        data
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Error interno' });
    }
  }
];
