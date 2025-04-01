const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Usuario = require('../models/Usuario');

/*GET para obtener todos los usuarios */
exports.getUsuario = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Usuario');
        const Usuario = result.recordset.map(record => new Usuario(record.usuario_id, record.rol_id, record.nombre_usuario, record.nombre, record.apellido,
            record.apellido, record.hash_contraseña, record.correo, record.telefono, record.residencia, record.genero, record.fecha_creacion, record.fecha_modificacion, record.estado_usuario
        ));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.json({ error: 'Error al obtener los Usuarios' });
    }
};

