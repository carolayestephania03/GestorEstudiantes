const {body, validationResult} = require('express-validator');
const sequelize = require('../../config/dbconfig');
const bitacora = require('../models/bitacora');
const moment = require('moment');


/* Operación GET hacia la base de datos */
exports.getData = async (req, res) => {
    try {
        const [data, metadata] = await sequelize.query(
            'SELECT * FROM bitacora'
        );
        res.send({data});
    } catch (error) {
        res-status(500).json({error: error.message});
    }
};