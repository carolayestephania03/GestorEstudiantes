const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Recuperacion_contraseña para la DB */
const RecuperacionContrasena = sequelize.define('RecuperacionContrasena', {
    recuperacion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo_autenticacion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado_autenticacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'recuperacion_contrasena',
    timestamps: false
  });

  module.exports = RecuperacionContrasena;
