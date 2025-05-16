const {body, validationResult} = require('express-validator');
const sequelize = require('../../config/dbconfig');
const bimestre = require('../models/bimestre');
const moment = require('moment');


/* Operación GET hacia la base de datos */
exports.getData = async (req, res) => {
    try {
        const [data, metadata] = await sequelize.query(
            'SELECT * FROM bimestre'
        );
        res.send({data});
    } catch (error) {
        res-status(500).json({error: error.message});
    }
};