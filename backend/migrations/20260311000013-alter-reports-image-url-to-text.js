'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reports', 'image_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reports', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
