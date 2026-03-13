'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_messages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      penca_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'pencas', key: 'id' } },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      content: { type: Sequelize.STRING(500), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('chat_messages', ['penca_id', 'created_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('chat_messages');
  },
};
