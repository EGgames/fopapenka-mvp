'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_read_cursors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      penca_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'pencas', key: 'id' } },
      last_read_message_id: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('chat_read_cursors', ['user_id', 'penca_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('chat_read_cursors');
  },
};
