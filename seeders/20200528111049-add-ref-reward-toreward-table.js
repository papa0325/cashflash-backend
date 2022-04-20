'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const d = new Date();
    const uuid = require('uuid/v4');
    await queryInterface.bulkInsert(
      'Rewards',
      [
        {
          id: uuid(),
          name: 'referral',
          amount: 120000,
          currencyId: 'cft',
          createdAt: d,
          updatedAt: d,
        },
      ],
      {
        ignoreDuplicates: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {},
};
