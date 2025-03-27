const mysql = require('mysql2/promise');
const connectToDatabase = require ('./app/config/dbconfig');

class Rol {
    constructor(rol_id, nombre_rol, fecha_creacion, fecha_modificacion) {
        this.rol_id = rol_id;
        this.nombre_rol = nombre_rol;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
    }
}

module.exports = Rol;