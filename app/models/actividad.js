const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Actividad para la DB */
    const actividad = sequelize.define('actividad', {
      actividad_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      materia_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bimestre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nombre_actividad: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      puntaje_maximo: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      tipo_actividad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado_actividad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      aviso_actividad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    }, {
      tableName: 'actividad',
      timestamps: false,
    });
  
    module.exports = actividad;