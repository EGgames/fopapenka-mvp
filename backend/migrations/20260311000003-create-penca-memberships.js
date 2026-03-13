'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penca_memberships', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      penca_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'pencas', key: 'id' } },
      role: { type: Sequelize.ENUM('admin', 'player'), defaultValue: 'player', allowNull: false },
      status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active', allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('penca_memberships', ['user_id', 'penca_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('penca_memberships');
  },
};
