const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Cliente = sequelize.define('Cliente', {
  nombre: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  aseguradora: {
    type: DataTypes.STRING(100),
    allowNull: true,
  }
}, {
  tableName: 'clientes',
  timestamps: true,
});

module.exports = Cliente;
