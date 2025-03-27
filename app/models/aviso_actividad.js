const mysql = require('mysql2/promise');
const connectToDatabase = require('../config/dbconfig');

class AvisoActividad {
    constructor(aviso_actividad_id, descripcion_aviso){
        this.aviso_actividad_id = aviso_actividad_id;
        this.descripcion_aviso = descripcion_aviso;
    }
}

module.exports = AvisoActividad;