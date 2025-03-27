const mysql = require('mysql2/promise');
const connectToDatabase = require('..app/config/dbconfig');

class Alumno {
    constructor (alumno_id, codigo, nombre_alumno, edad, genero, fecha_nacimiento, repitente, residencia, nombre_padre_encargado,
        telefono, grado_seccion_id, estado_alumno
    ){
        this.alumno_id = alumno_id;
        this.codigo = codigo;
        this.nombre_alumno = nombre_alumno;
        this.edad = edad;
        this.genero = genero;
        this.fecha_nacimiento = fecha_nacimiento;
        this.repitente = repitente;
        this.residencia = residencia;
        this.nombre_padre_encargado = nombre_padre_encargado;
        this.telefono = telefono;
        this.grado_seccion_id = grado_seccion_id;
        this.estado_alumno = estado_alumno;
    }
}

module.exports = Alumno;
