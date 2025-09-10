/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const PromedioAmbito = require('../models/Promedio_ambito');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await PromedioAmbito.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};