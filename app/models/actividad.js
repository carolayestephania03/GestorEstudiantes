const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Actividad {
    constructor(actividad_id, usuario_id, materia_id, bimestre_id, nombre_actividad, descripcion, fecha_creacion, fecha_entrega, 
        puntaje_maximo, tipo_actividad_id, estado_actividad_id, aviso_actividad_id  
    ){
        this.actividad_id = actividad_id;
        this.usuario_id = usuario_id;
        this.materia_id = materia_id;
        this.bimestre_id = bimestre_id;
        this.nombre_actividad = nombre_actividad;
        this.descripcion = descripcion;
        this.fecha_creacion = fecha_creacion;
        this.fecha_entrega = fecha_entrega;
        this.puntaje_maximo = puntaje_maximo;
        this.tipo_actividad_id = tipo_actividad_id;
        this.estado_actividad_id = estado_actividad_id;
        this.aviso_actividad_id = aviso_actividad_id;
    }
}

module.exports = Actividad;