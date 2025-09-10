const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
require('dotenv').config({});

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: '127.0.0.1', // Cambiado de 'server' a 'host'
    user: 'eormSchool',
    password: 'EORM$chool2025',
    database: 'eorm_escuela',
    port: 3306,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port,
    logging: false, // Desactiva los logs de SQL
});

module.exports = sequelize;