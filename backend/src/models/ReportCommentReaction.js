const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportCommentReaction = sequelize.define('ReportCommentReaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  comment_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  reaction: { type: DataTypes.ENUM('like', 'dislike'), allowNull: false },
}, {
  tableName: 'report_comment_reactions',
  underscored: true,
});

module.exports = ReportCommentReaction;
