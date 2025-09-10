/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');

/**Creación del modelo de la DB*/
const Forgot_password = sequelize.define('forgot_password', {
    forgot_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    autentication_code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'Recuperacion_Contrasena', // Nombre de la tabla en la base de datos
    timestamps: false // No Crear timestamps automáticos como createdAt y updatedAt
});

module.exports = Forgot_password;
