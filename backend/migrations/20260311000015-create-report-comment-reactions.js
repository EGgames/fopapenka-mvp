'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_comment_reactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'report_comments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reaction: {
        type: Sequelize.ENUM('like', 'dislike'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('report_comment_reactions', {
      fields: ['comment_id', 'user_id'],
      type: 'unique',
      name: 'uq_reaction_comment_user',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('report_comment_reactions');
  },
};
