const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost', // Cambiado de 'server' a 'host'
    user: 'root',
    password: 'Carolay123',
    database: 'escuela_linda_vista',
};

let pool;

const ConnecToDataBase = async () => {
    if (!pool) {
        try {
            // Crear un pool de conexiones
            pool = mysql.createPool(dbConfig);
            console.log('Conexión a la base de datos establecida');
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error);
            throw error;
        }
    }
    return pool;
};

module.exports = ConnecToDataBase;
