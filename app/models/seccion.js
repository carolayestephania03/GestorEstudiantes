const mysql = require('mysql');
const connectToDatabase = require('../config/dbconfig');

class Seccion {
    constructor(seccion_id, seccion_des, estado_seccion) {
        this.seccion_id = seccion_id;
        this.seccion_des = seccion_des;
        this.estado_seccion = estado_seccion;
    }
}

module.exports = Seccion;