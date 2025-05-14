const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Bimestre para la DB */
const Bimestre = sequelize.define('Bimestre', {
    bimestre_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_bimestre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    estado_bimestre: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'Bimestre',
    timestamps: false
  });

  module.exports = Bimestre;
