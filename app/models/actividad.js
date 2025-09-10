/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Actividad */
const Actividad = sequelize.define('Actividad', {
    actividad_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    materia_tipo_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    nombre_actividad: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: false
    },
    puntaje_maximo: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    estado_actividad_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    aviso_actividad_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    ciclo_escolar_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    }
}, {
    tableName: 'Actividad',
    timestamps: false
});

module.exports = Actividad;