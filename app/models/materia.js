const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Materia para la DB */
const Materia = sequelize.define('Materia', {
    materia_id: {
      type: DataTypes.INTEGER,
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
    estado_materia: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Materia',
    timestamps: false
  });

  module.exports = Materia;