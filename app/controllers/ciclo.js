const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Ciclo = require('../models/ciclo');

/*GET para obtener todos los ciclos */
exports.getCiclo = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Ciclo');
        const Ciclo = result.recordset.map(record => new Ciclo(record.ciclo_id, record.año));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los ciclos:', error);
        res.json({ error: 'Error al obtener los ciclos' });
    }
};

