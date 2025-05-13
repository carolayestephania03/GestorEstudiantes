const {DataTypes} = require('sequelize');
const sequelize = require('../../config/db.config');

/* Modelo Usuario para la DB */
const Usuario = sequelize.define('Usuario', {
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    hash_contrasena: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    },
    residencia: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    genero: {
      type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
      allowNull: false
    },
    dpi: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    codigo_empleado: {
      type: DataTypes.INTEGER,
      unique: true
    },
    cedula_docente: {
      type: DataTypes.INTEGER,
      unique: true
    },
    fecha_inicio_labores: {
      type: DataTypes.DATEONLY
    },
    escalafon: {
      type: DataTypes.STRING(1)
    },
    renglon: {
      type: DataTypes.STRING(3)
    },
    codigo_institucional: {
      type: DataTypes.INTEGER
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado_usuario: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Usuario',
    timestamps: false
  });

  module.exports = Usuario;