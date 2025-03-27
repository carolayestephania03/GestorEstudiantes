const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Bimestre {
    constructor(bimestre_id, nombre_id, estado_bimestre) {
        this.bimestre_id = bimestre_id;
        this.nombre_id = nombre_id;
        this.estado_bimestre = estado_bimestre;
    }
}

module.exports = Bimestre;