const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // nickname único globalmente para simplificar joins; la unicidad por penca se valida en servicio
  nickname: { type: DataTypes.STRING(50), allowNull: false },
  cedula_hash: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'users',
  underscored: true,
});

module.exports = User;
