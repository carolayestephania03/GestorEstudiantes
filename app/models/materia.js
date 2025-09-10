/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Materia */
const Materia = sequelize.define('Materia', {
    materia_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_materia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    descripcion_materia: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'Materia',
    timestamps: false
});

module.exports = Materia;