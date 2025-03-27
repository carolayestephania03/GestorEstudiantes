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

/**GET para obtener actividad por ID */
exports.getActividadeById = async (req, res) => {
    const { id_actividad } = req.params;
    try {
        const pool = await ConnecToDataBase();
        const result = await pool.request().input('id_actividad', mysql.Int, id_actividad).query('SELECT * FROM actividad WHERE id_actividad = @id_actividad');
        const actividad = result.recordset[0];
        if (actividad) {
            res.send({ data: new Actividad(actividad.id_actividad, actividad.id_materia, actividad.id_maestro, actividad.descripcion, actividad.fecha, actividad.tipo_actividad, actividad.estado) });
        } else {
            res.status(404).send({ message: 'Actividad no encontrada' });
        }
    }
    catch (error) {
        console.error('Error al obtener la actividad:', error);
        res.json({ error: 'Error al obtener la actividad' });
    }
};

