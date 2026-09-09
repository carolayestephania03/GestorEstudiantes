/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const SituacionAlumno = require('../models/SituacionAlumno');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await SituacionAlumno.findAll({
            where: {
                estado: 1
            }
        });

        return res.status(200).json({
            message: 'Situacion Alumno activos obtenidos correctamente',
            data: data || []
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message || 'Error interno del servidor'
        });
    }
};

/* =========================================================
   INSERT - CREAR SITUACION ACTUAL
========================================================= */
exports.postData = [
    body('siglas')
        .trim()
        .notEmpty().withMessage('siglas situacion es requerido')
        .isLength({ max: 10 }).withMessage('siglas situacion máximo 10 caracteres')
        .custom(v => {
            if (v.includes(';') || v.includes('--')) {
                throw new Error('Caracteres inválidos');
            }
            return true;
        }),

    body('descripcion')
        .trim()
        .notEmpty().withMessage('nombre situacion es requerido')
        .isLength({ max: 100 }).withMessage('nombre situacion máximo 100 caracteres')
        .custom(v => {
            if (v.includes(';') || v.includes('--')) {
                throw new Error('Caracteres inválidos');
            }
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const nombre_situacion = req.body.descripcion.trim();

            const existe = await SituacionAlumno.findOne({
                where: { descripcion: nombre_situacion }
            });

            if (existe) {
                return res.status(409).json({
                    error: 'La situación ya existe'
                });
            }

            const data = await SituacionAlumno.create({
                descripcion: nombre_situacion,
                estado: 1
            });

            return res.status(201).json({
                message: 'Situación creada correctamente',
                data
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message || 'Error interno del servidor'
            });
        }
    }
];

/* =========================================================
   UPDATE - EDITAR NOMBRE DEL ESCALAFON
========================================================= */
exports.putData = [
    body('Situacion_Alumno_id')
        .toInt()
        .isInt({ gt: 0 }).withMessage('Situacion_Alumno_id debe ser entero > 0'),

    body('siglas')
        .trim()
        .notEmpty().withMessage('siglas situacion es requerido')
        .isLength({ max: 10 }).withMessage('siglas situacion máximo 10 caracteres')
        .custom(v => {
            if (v.includes(';') || v.includes('--')) {
                throw new Error('Caracteres inválidos');
            }
            return true;
        }),


    body('descripcion')
        .trim()
        .notEmpty().withMessage('nombre situación es requerido')
        .isLength({ max: 100 }).withMessage('nombre situación máximo 100 caracteres')
        .custom(v => {
            if (v.includes(';') || v.includes('--')) {
                throw new Error('Caracteres inválidos');
            }
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const situacion_alumno_id = Number(req.body.Situacion_Alumno_id);
            const siglas = req.body.siglas.trim();
            const nombre_situacion = req.body.descripcion.trim();

            const Situacion = await SituacionAlumno.findOne({
                where: { situacion_alumno_id }
            });

            if (!Situacion) {
                return res.status(404).json({
                    error: 'Situación no encontrada'
                });
            }

            const duplicado = await SituacionAlumno.findOne({
                where: { descripcion: siglas }
            });

            if (duplicado && Number(duplicado.situacion_alumno_id) !== situacion_alumno_id) {
                return res.status(409).json({
                    error: 'Ya existe otra situación con ese nombre'
                });
            }

            await Situacion.update({
                siglas: siglas,
                descripcion: nombre_situacion
            });

            return res.status(200).json({
                message: 'Situación actualizada correctamente',
                data: Situacion
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message || 'Error interno del servidor'
            });
        }
    }
];

/* =========================================================
   DELETE LOGICO - DESACTIVAR ESCALAFON
========================================================= */
exports.deleteData = [
    body('Situacion_Alumno_id')
        .toInt()
        .isInt({ gt: 0 }).withMessage('Situacion_Alumno_id debe ser entero > 0'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const situacion_alumno_id = Number(req.body.Situacion_Alumno_id);

            const Situacion = await SituacionAlumno.findOne({
                where: { situacion_alumno_id }
            });

            if (!Situacion) {
                return res.status(404).json({
                    error: 'Situación no encontrada'
                });
            }

            await Situacion.update({
                estado: 0
            });

            return res.status(200).json({
                message: 'Situación desactivada correctamente',
                data: Situacion
            });
        } catch (error) {
            return res.status(500).json({
                error: error.message || 'Error interno del servidor'
            });
        }
    }
];