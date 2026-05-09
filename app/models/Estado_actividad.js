/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Estado_Actividad */
const Estado_Actividad = sequelize.define('Estado_Actividad', {
    estado_actividad_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion_estado: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'estado_actividad',
    timestamps: false
});

module.exports = Estado_Actividad;
