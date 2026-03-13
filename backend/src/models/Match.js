const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fixture_id: { type: DataTypes.INTEGER, allowNull: false },
  home_team_id: { type: DataTypes.INTEGER, allowNull: false },
  away_team_id: { type: DataTypes.INTEGER, allowNull: false },
  home_score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  away_score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  match_date: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('scheduled', 'played'), defaultValue: 'scheduled', allowNull: false },
}, {
  tableName: 'matches',
  underscored: true,
});

module.exports = Match;
