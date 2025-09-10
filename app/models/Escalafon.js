/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Escalafon */
const Escalafon = sequelize.define('Escalafon', {
    escalafon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'Escalafon',
    timestamps: false // No Crear timestamps automáticos como createdAt y updatedAt
});

module.exports = Escalafon;