'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('predictions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      match_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'matches', key: 'id' } },
      penca_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'pencas', key: 'id' } },
      predicted_home: { type: Sequelize.INTEGER, allowNull: false },
      predicted_away: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('predictions', ['user_id', 'match_id', 'penca_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('predictions');
  },
};
