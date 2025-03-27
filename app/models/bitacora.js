const mysql = require('mysql2/promise');
const connectToDatabase = require('../config/dbconfig');

class Bitacora {
    constructor(bitacora_id, usuario_id, descripcion, fecha_creacion, fecha_modificacion, estado_bitacora){
        this.bitacora_id = bitacora_id;
        this.usuario_id = usuario_id;
        this.descripcion = descripcion;
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.estado_bitacora = estado_bitacora;
    }
}

module.exports = Bitacora;