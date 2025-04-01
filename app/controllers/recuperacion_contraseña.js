const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const recuperacion_contraseña = require('../models/recuperacion_contraseña');

/*GET para obtener recuperacion de contraseña */
exports.getRecuperacion_contraseña = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM recuperacion_contraseña');
        const recuperacion_contraseña = result.recordset.map(record => new recuperacion_contraseña(record.recuperacion_id, record.codigo_autenticacion, record.usuario_id, record.estado_autenticacion));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener la recuperacion de contraseña:', error);
        res.json({ error: 'Error al obtener la recuperacion de contraseña' });
    }
};

