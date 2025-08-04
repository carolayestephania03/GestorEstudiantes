const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const usuario = require('../models/usuario');
const moment = require('moment');


/* Operación GET hacia la base de datos */
exports.getData = async (req, res) => {
    try {
        const [data, metadata] = await sequelize.query(
            'SELECT * FROM usuario'
        );
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* Operación GET para obtener usuarios por ID */
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [data, metadata] = await sequelize.query(
            'SELECT * FROM usuario WHERE usuario_id = :id',
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT
            }
        );
        if (data.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* Operación POST para crear un nuevo usuario */
exports.postData = [
    body('nombre_usuario')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .customSanitizer(value => {
            if (value.includes(';') || value.includes('--')) {
                throw new Error('Caracteres inválidos detectados');
            }
            return value;
        }),

    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre completo es obligatorio')
        .customSanitizer(value => {
            if (value.includes(';') || value.includes('--')) {
                throw new Error('Caracteres inválidos detectados');
            }
            return value;
        }),


    body('correo')
        .trim()
        .notEmpty().withMessage('El correo electronico es obligatorio')
        .customSanitizer(value => {
            if (value.includes(';') || value.includes('--')) {
                throw new Error('Caracteres inválidos detectados');
            }
            return value;
        }),

    body('telefono')
        .trim()
        .notEmpty().withMessage('El número de teléfono es obligatorio')
        .isNumeric().withMessage('El número de teléfono debe ser numérico')
        .customSanitizer(value => {
            if (value.includes(';') || value.includes('--')) {
                throw new Error('Caracteres inválidos detectados');
            }
            return value;
        }),


    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { 
                nombre_usuario, 
                nombre, 
                correo, 
                telefono 
            } = req.body;

            const emailQuery = `
                  SELECT correo FROM usuario WHERE correo = :correo
            `;
            const [emailResult] = await sequelize.query(emailQuery, {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT
            });
            if (emailResult) {
                return res.status(401).json({ message: 'El correo electrónico ya está en uso' });
            }

            // Ejecutar el procedimiento almacenado
            const query = `
                CALL crear_usuario(
                :nombre_usuario, 
                :nombre, 
                :correo, 
                :telefono, 
                @temp_pass
                );
            `; 

            await sequelize.query(query, {
                replacements: { 
                    nombre_usuario, 
                    nombre, 
                    correo, 
                    telefono 
                },
            });
            // Obtener la contraseña generada
            const [[result]] = await sequelize.query('SELECT @temp_pass AS contrasena_temporal');

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                contrasena_temporal: result.contrasena_temporal,
            });
        
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }       
];
