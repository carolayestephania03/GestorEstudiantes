const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Aviso_actividad = require('../models/aviso_actividad');

/*GET para obtener todos los avisos de actividad */
exports.getAviso_actividad = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM aviso_actividad');
        const aviso_actividad = result.recordset.map(record => new Aviso_actividad(record.aviso_actividad_id, record.descripcion_estado));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los avisos de actividad:', error);
        res.json({ error: 'Error al obtener los avisos de actividad' });
    }
};

