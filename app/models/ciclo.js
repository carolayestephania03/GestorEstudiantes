const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Ciclo para la DB */
const Ciclo = sequelize.define('Ciclo', {
    ciclo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    año: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Ciclo',
    timestamps: false
  });

  module.exports = Ciclo;