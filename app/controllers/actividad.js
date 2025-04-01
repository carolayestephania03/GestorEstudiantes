const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Actividad = require('../models/actividad');

/*GET para obtener todas las actividades */
exports.getActividades = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM actividad');
        const actividad = result.recordset.map(record => new Actividad(record.id_actividad, record.id_materia, record.id_maestro, record.descripcion, record.fecha, record.tipo_actividad, record.estado));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener las actividades:', error);
        res.json({ error: 'Error al obtener las actividades' });
    }
};



