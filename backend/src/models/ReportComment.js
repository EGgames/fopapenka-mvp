const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportComment = sequelize.define('ReportComment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  report_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  content: { type: DataTypes.STRING(500), allowNull: false },
}, {
  tableName: 'report_comments',
  underscored: true,
});

module.exports = ReportComment;
