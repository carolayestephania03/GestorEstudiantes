const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Grado {
    constructor(grado_id, grado_des, estado_grado) {
        this.grado_id = grado_id;
        this.grado_des = grado_des;
        this.estado_grado = estado_grado;
    }
}

module.exports = Grado;