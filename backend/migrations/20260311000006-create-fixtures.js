'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fixtures', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tournament_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'tournaments', key: 'id' } },
      number: { type: Sequelize.INTEGER, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('fixtures', ['tournament_id', 'number'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('fixtures');
  },
};
