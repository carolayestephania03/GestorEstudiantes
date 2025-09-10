/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Persona */
const Persona = sequelize.define('Persona', {
    persona_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(50),
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
    genero_id: {
        type: DataTypes.ENUM('M', 'F'),
        allowNull: true
    },
    dpi: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false
    },
    nit: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'Persona',
    timestamps: false
});

module.exports = Persona;