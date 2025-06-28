const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Cliente = sequelize.define('Cliente', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: DataTypes.STRING,
  telefono: DataTypes.STRING,
  fecha_inicio: DataTypes.STRING,
  aseguradora: DataTypes.STRING,
}, {
  tableName: 'clientes',
  timestamps: true,
});

module.exports = Cliente;