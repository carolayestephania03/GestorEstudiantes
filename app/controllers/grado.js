const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Grado = require('../models/grado');

/*GET para obtener todos los grados */
exports.getGrado = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Grado');
        const Grado = result.recordset.map(record => new Grado(record.bimestre_id, record.nombre_bimestre, record.estado_bimestre));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los Grados:', error);
        res.json({ error: 'Error al obtener los Grados' });
    }
};

