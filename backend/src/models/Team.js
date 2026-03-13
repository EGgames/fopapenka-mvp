const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tournament_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  logo_url: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'teams',
  underscored: true,
  indexes: [
    { unique: true, fields: ['tournament_id', 'name'] },
  ],
});

module.exports = Team;
