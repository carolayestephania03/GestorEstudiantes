const express = require('express');
const controller = require('../controllers/Persona');
const router = express.Router();
const auth = require('../middleware/auth');

const path = 'persona';


module.exports = router;