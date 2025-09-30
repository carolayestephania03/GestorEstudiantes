const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
require('dotenv').config({});

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.HOST_DB, // Cambiado de 'server' a 'host'
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB_NAME,
    port: process.env.PORT_DB,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql',
    port: dbConfig.port,
    logging: false, // Desactiva los logs de SQL
});

module.exports = sequelize;