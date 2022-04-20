'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.addColumn('Users',
          'country',
          {
            type: Sequelize.STRING,
            allowNull: true
          }
      );
      transaction.commit();
    } catch (e) {
      transaction.rollback()
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.removeColumn('Users', 'country');
      transaction.commit();
    } catch (e) {
      transaction.rollback()
    }
  }
};
