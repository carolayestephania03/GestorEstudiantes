const mysql = require('mysql2/promise');
const ConnecToDataBase = require('../config/dbconfig');
const Bitacora = require('../models/bitacora');

/*GET para obtener todos los datos de bitacora */
exports.getBitacora = async (req, res) => {
    try {
        const pool = await ConnecToDataBase();
        const [result] = await pool.reuest().query('SELECT * FROM Bitacora');
        const bitacora = result.recordset.map(record => new Bitacora(record.bitacora_id, record.usuario_id, record.descripcion, 
            record.fecha_creacion, record.fecha_modificacion, record.estado_bitacora));
        res.json(rows);
    }
    catch (error) {
        console.error('Error al obtener la bitacora:', error);
        res.json({ error: 'Error al obtener la bitacora' });
    }
};

