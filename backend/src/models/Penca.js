const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Penca = sequelize.define('Penca', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  invite_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active', allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true }, // user id del admin fundador
}, {
  tableName: 'pencas',
  underscored: true,
});

module.exports = Penca;
