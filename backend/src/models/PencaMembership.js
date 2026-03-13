const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PencaMembership = sequelize.define('PencaMembership', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  penca_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'player'), defaultValue: 'player', allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active', allowNull: false },
}, {
  tableName: 'penca_memberships',
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'penca_id'] },
  ],
});

module.exports = PencaMembership;
