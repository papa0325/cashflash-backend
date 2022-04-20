'use strict';
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Currencies',[{
      id: 'eos',
      fullTitle: 'EOS',
      decimals: 4,
      currentRate: 0,
      symbol:'EOS',
      createdAt:d,
      updatedAt:d,
      meta:JSON.stringify({
        greetingBonus:50000
      })
    },{
      id: 'cft',
      fullTitle: 'CFT',
      decimals: 4,
      currentRate: 0,
      parentId: 'eos',
      symbol:'CFT',
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
      id:{[Sequelize.Op.in]:['eos','cft']}
    })
  }
};
