const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fixture = sequelize.define('Fixture', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tournament_id: { type: DataTypes.INTEGER, allowNull: false },
  number: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
}, {
  tableName: 'fixtures',
  underscored: true,
  indexes: [
    { unique: true, fields: ['tournament_id', 'number'] },
  ],
});

module.exports = Fixture;
