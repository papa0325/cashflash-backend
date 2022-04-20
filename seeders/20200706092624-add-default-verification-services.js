module.exports = {
  up: async (queryInterface, Sequelize) => {
    const d = new Date();
    const uuid = require('uuid/v4');

    await queryInterface.bulkInsert('vServices', [{
      id: uuid(),
      name: 'w2',
      createdAt: d,
      updatedAt: d
    }
    ], {
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {

  }
};
