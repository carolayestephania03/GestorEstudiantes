/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Forgot_password = require('../models/autentication-code');
const config = require('../../config/jwt');
const sequelize = require('../../config/dbconfig');
const mailer = require('../../config/nodemailer');
const crypto = require('crypto'); 

/**Operación GET hacia la DB*/
exports.getData = async (req, res) => {
    try {
        /*Crear vista*/
        const [data, metadata] = await sequelize.query("SELECT * FROM vista_usuario");
        res.send({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};