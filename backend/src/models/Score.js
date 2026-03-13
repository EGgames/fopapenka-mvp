const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  prediction_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: '0, 1 o 3' },
}, {
  tableName: 'scores',
  underscored: true,
});

module.exports = Score;
