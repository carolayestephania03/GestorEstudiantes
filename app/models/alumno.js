/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Alumno */
const Alumno = sequelize.define('Alumno', {
    alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    persona_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    encargado_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    grado_seccion_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    estado_alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'Alumno',
    timestamps: false
});

module.exports = Alumno;