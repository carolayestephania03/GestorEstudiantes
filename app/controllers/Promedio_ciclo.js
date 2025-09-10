/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const PromedioCiclo = require('../models/Promedio_ciclo');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await PromedioCiclo.findAll({
            where: {
                estado: 1
            }
        });
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};