const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Calificacion_actividad = require('../models/calificacion_actividad');

/*GET para obtener todas las calificaciones de actividad */
exports.getCalificacion_actividad = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Calificacion_actividad');
        const Calificacion_actividad = result.recordset.map(record => new Calificacion_actividad(record.calificacion_id, record.alumno_id, record.actividad_id, record.puntaje_obtenido));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener las calificaciones de actividad:', error);
        res.json({ error: 'Error al obtener las calificaciones de actividad' });
    }
};

