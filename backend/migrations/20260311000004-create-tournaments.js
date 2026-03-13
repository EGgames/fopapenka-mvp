'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tournaments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      penca_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'pencas', key: 'id' } },
      name: { type: Sequelize.STRING(100), allowNull: false },
      year: { type: Sequelize.INTEGER, allowNull: false },
      continuity_mode: { type: Sequelize.ENUM('accumulate', 'reset'), allowNull: false, defaultValue: 'accumulate' },
      status: { type: Sequelize.ENUM('active', 'finished'), defaultValue: 'active', allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tournaments');
  },
};
