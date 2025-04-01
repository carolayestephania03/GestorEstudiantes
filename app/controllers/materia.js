const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Materia = require('../models/materia');

/*GET para obtener todas las materias */
exports.getMateria = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Materia');
        const materia = result.recordset.map(record => new Materia(record.materia_id, record.nombre_materia, record.descripcion_materia, estado_materia));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener las materias:', error);
        res.json({ error: 'Error al obtener las materias' });
    }
};

