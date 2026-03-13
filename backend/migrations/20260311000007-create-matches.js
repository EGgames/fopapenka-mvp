'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matches', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fixture_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'fixtures', key: 'id' } },
      home_team_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' } },
      away_team_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' } },
      home_score: { type: Sequelize.INTEGER, allowNull: true },
      away_score: { type: Sequelize.INTEGER, allowNull: true },
      match_date: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.ENUM('scheduled', 'played'), defaultValue: 'scheduled', allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('matches');
  },
};
