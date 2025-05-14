const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Encargado para la DB */
const Encargado = sequelize.define('Encargado', {
    encargado_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    dpi: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    estado_encargado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Encargado',
    timestamps: false
  });

  module.exports = Encargado;