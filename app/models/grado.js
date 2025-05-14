const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Grado para la DB */
const Grado = sequelize.define('Grado', {
    grado_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    grado_des: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estado_grado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Grado',
    timestamps: false
  });

  module.exports = Grado;