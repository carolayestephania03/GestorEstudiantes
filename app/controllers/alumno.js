const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Actividad = require('../models/alumno');

/*GET para obtener todos los alumnos */
exports.getAlumno = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM alumno');
        const alumno = result.recordset.map(record => new Alumno(record.alumno_id, record.codigo, record.nombre_alumno, record.edad, record.genero, record.fecha_nacimiento,
            record.repitente, record.residencia, record.nombre_padre_encargado, record.dpi_padre_encargado, record.telefono, record.grado_seccion_id, record.estado_alumno));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener los alumnos:', error);
        res.json({ error: 'Error al obtener los alumnos' });
    }
};

