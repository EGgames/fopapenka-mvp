const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  penca_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  continuity_mode: {
    type: DataTypes.ENUM('accumulate', 'reset'),
    allowNull: false,
    defaultValue: 'accumulate',
    comment: 'accumulate: suma puntos al ranking global; reset: reinicia ranking desde 0',
  },
  status: { type: DataTypes.ENUM('active', 'finished'), defaultValue: 'active', allowNull: false },
}, {
  tableName: 'tournaments',
  underscored: true,
});

module.exports = Tournament;
