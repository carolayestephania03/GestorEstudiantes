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