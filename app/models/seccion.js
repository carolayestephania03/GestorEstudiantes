const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Seccion para la DB */
const Seccion = sequelize.define('Seccion', {
    seccion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seccion_des: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estado_seccion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Seccion',
    timestamps: false
  });

  module.exports = Seccion;