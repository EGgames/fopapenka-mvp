'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tournament_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tournaments', key: 'id' } },
      name: { type: Sequelize.STRING(100), allowNull: false },
      logo_url: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('teams', ['tournament_id', 'name'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('teams');
  },
};
