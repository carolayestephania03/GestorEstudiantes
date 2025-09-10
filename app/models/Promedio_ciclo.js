/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Promedio_Ciclo */
const Promedio_Ciclo = sequelize.define('Promedio_Ciclo', {
    promedio_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    materia_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    ciclo_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    ciclo_escolar_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    promedio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'Promedio_Ciclo',
    timestamps: false
});

module.exports = Promedio_Ciclo;