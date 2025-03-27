const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Usuario {
    constructor(id_usuario, rol_id, nombre, apellido, email, constraseña, telefono, estado) {
        this.id_usuario = id_usuario;
        this.rol_id = rol_id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.constraseña = constraseña;
        this.telefono = telefono;
        this.estado = estado;
    }
}

module.exports = Usuario;