const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Bitacora para la DB */
const Bitacora = sequelize.define('Bitacora', {
    bitacora_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_bitacora: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Bitacora',
    timestamps: false
  });

  module.exports = Bitacora;
