/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Tipo_Actividad */
const Tipo_Actividad = sequelize.define('Tipo_Actividad', {
    tipo_actividad_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion_tipo: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'Tipo_Actividad',
    timestamps: false
});

module.exports = Tipo_Actividad;