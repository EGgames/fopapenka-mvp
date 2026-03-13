const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prediction = sequelize.define('Prediction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  match_id: { type: DataTypes.INTEGER, allowNull: false },
  penca_id: { type: DataTypes.INTEGER, allowNull: false },
  predicted_home: { type: DataTypes.INTEGER, allowNull: false },
  predicted_away: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'predictions',
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'match_id', 'penca_id'] },
  ],
});

module.exports = Prediction;
