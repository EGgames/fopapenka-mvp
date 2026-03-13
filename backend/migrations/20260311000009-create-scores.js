'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      prediction_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'predictions', key: 'id' } },
      points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('scores');
  },
};
