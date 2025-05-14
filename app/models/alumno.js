const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbconfig');

/* Modelo Alumno para la DB */
    const Alumno = sequelize.define('Alumno', {
      alumno_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre_alumno: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      edad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      genero: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      repitente: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      residencia: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      grado_seccion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      encargado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado_alumno: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    }, {
      tableName: 'Alumno',
      timestamps: false
    });
  
    module.exports = Alumno;
  
