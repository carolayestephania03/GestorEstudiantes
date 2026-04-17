/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Escalafon */
const SituacionAlumno = sequelize.define('Situacion_Alumno', {
    situacion_alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    siglas: {
        type: DataTypes.STRING(10),
        allowNull: false
    },    
    descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'Situacion_Alumno',
    timestamps: false // No Crear timestamps automáticos como createdAt y updatedAt
});

module.exports = SituacionAlumno;