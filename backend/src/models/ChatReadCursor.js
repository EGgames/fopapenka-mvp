const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatReadCursor = sequelize.define('ChatReadCursor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  penca_id: { type: DataTypes.INTEGER, allowNull: false },
  last_read_message_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'chat_read_cursors',
  underscored: true,
});

module.exports = ChatReadCursor;
