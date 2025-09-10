/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const sequelize = require('../../config/dbconfig');
const Alumno = require('../models/Alumno');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Alumno.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};