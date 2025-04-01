const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Seccion = require('../models/seccion');

/*GET para obtener todos las secciones */
exports.getSeccion = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM seccion');
        const seccion = result.recordset.map(record => new seccion(record.seccion_id, record.seccion_des, record.estado_seccion));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.json({ error: 'Error al obtener las secciones' });
    }
};

