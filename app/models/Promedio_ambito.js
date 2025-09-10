/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Promedio_Ambito */
const Promedio_Ambito = sequelize.define('Promedio_Ambito', {
    promedio_ambito_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    alumno_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    materia_tipo_id: {
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
    promedio_ambito: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    fecha_calculo: {
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
    tableName: 'Promedio_Ambito',
    timestamps: false
});

module.exports = Promedio_Ambito;