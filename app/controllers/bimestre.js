const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Bimestre = require('../models/bimestre');

/*GET para obtener todos los bimestres */
exports.getBimestre = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Bimestre');
        const bimestre = result.recordset.map(record => new Bimestre(record.bimestre_id, record.nombre_bimestre, record.estado_bimestre));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los bimestres:', error);
        res.json({ error: 'Error al obtener los bimestres' });
    }
};

