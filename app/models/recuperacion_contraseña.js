const mysql = require('mysql2/promise');
const connectToDatabase = require('./app/config/dbconfig');

class Recuperacion_Contraseña {
    constructor(recuperacion_id, codigo_autentication, usuario_id, estado_autentication){
        this.recuperacion_id = recuperacion_id;
        this.codigo_autentication = codigo_autentication;
        this.usuario_id = usuario_id;
        this.estado_autentication = estado_autentication;
    }
}

module.exports = Recuperacion_Contraseña;