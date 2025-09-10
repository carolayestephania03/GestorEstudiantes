/**Depedencias utilizadas */
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbconfig');
const bcrypt = require('bcrypt');

/**Modelo Usuario */
const Usuario = sequelize.define('Usuario', {
    usuario_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    persona_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    rol_id: {
        type: DataTypes.ENUM('D', 'M', 'S'),
        allowNull: true
    },
    nombre_usuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    hash_contrasena: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    codigo_empleado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    cedula_docente: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    fecha_inicio_labores: {
        type: DataTypes.DATE,
        allowNull: true
    },
    escalafon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    renglon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    codigo_institucional: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    fecha_modificacion: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
        tableName: 'Usuario',
        timestamps: false,
        hooks: {
            /*Encriptación de las contraseñas */
            beforeCreate: async (Usuario) => {
                if (Usuario.hash_contrasena) {
                    const salt = await bcrypt.genSalt(10);
                    Usuario.hash_contrasena = await bcrypt.hash(Usuario.hash_contrasena, salt);
                }
            },
            beforeUpdate: async (Usuario) => {
                if (Usuario.hash_contrasena) {
                    const salt = await bcrypt.genSalt(10);
                    Usuario.hash_contrasena = await bcrypt.hash(Usuario.hash_contrasena, salt);
                }
            }
        }
    });

    module.exports = Usuario;
