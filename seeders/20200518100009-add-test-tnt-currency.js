'use strict';
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Currencies',[{
      id: 'tnt',
      fullTitle: 'TNT',
      decimals: 4,
      currentRate: 0,
      symbol:'TNT',
      parentId:'EOS',
      createdAt:d,
      updatedAt:d,
      meta:JSON.stringify({
        greetingBonus:50000
      })
    }
    ],{
      ignoreDuplicates: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Currencies',{
      id:{[Sequelize.Op.in]:['tnt']}
    })
  }
};
