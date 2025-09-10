/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Modelo Renglon */
const Renglon = sequelize.define('Renglon', {
    renglon_id: {
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
    tableName: 'Renglon',
    timestamps: false
});

module.exports = Renglon;