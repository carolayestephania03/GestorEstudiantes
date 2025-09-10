/**Depedencias utilizadas */
const { body, validationResult } = require('express-validator');
const Persona = require('../models/Persona');
const sequelize = require('../../config/dbconfig');
