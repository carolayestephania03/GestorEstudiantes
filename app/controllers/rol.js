const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Rol = require('../models/rol');

/*GET para obtener todos los roles */
exports.getRol = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM rol');
        const rol = result.recordset.map(record => new rol(record.rol_id, record.nombre_rol, record.fecha_creacion, record.fecha_modificacion));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los roles:', error);
        res.json({ error: 'Error al obtener los roles' });
    }
};

