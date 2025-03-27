const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Materia {
    constructor(materia_id, nombre_materia, descripcion_materia, estado_materia) {
        this.materia_id = materia_id;
        this.nombre_materia = nombre_materia;
        this.descripcion_materia = descripcion_materia;
        this.estado_materia = estado_materia;
    }
}

module.exports = Materia;