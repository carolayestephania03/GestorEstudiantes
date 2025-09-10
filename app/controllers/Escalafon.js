/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Escalafon = require('../models/Escalafon');
const sequelize = require('../../config/dbconfig');

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        const data = await Escalafon.findAll();
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};