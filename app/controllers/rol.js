const {body, validationResult} = require('express-validator');
const rol = require('../models/rol');
const { op } = require('sequelize');


/* Operación GET hacia la base de datos */
exports.getData = async (req, res) => {
    try {
        // encuentra todos los registros exepto los que tienen rol_id = 1
        const data = await rol.findAll({
            where: {
                estado: 1
            }
        });
        res.send({data});
    } catch (error) {
        res-status(500).json({error: error.message});
    }
};