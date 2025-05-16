const {body, validationResult} = require('express-validator');
const sequelize = require('../../config/dbconfig');
const encargado = require('../models/encargado');
const moment = require('moment');


/* Operación GET hacia la base de datos */
exports.getData = async (req, res) => {
    try {
        const [data, metadata] = await sequelize.query(
            'SELECT * FROM encargado'
        );
        res.send({data});
    } catch (error) {
        res-status(500).json({error: error.message});
    }
};