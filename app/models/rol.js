const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Rol para la DB */
const Rol = sequelize.define('Rol', {
    rol_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Rol',
    timestamps: false
  });

  module.exports = Rol;