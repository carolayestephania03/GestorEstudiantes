const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Calificacion_actividad {
    constructor(calificacion_id, alumno_id, actividad_id, puntaje_obtenido) {
        this.calificacion_id = calificacion_id;
        this.alumno_id = alumno_id;
        this.actividad_id = actividad_id;
        this.puntaje_obtenido = puntaje_obtenido;
    }
}

module.exports = Calificacion_actividad;