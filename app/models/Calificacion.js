/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Calificacion */
const Calificacion = sequelize.define('Calificacion', {
    calificacion_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    actividad_alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    puntaje_obtenido: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'Calificacion',
    timestamps: false
});

module.exports = Calificacion;