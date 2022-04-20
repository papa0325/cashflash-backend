const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PurchaseBonus', [
      {
        level: 1,
        minAmount: '100',
        maxAmount: '100000',
        currencyId: 'eur',
        reward: '5'
      },
      {
        level: 2,
        minAmount: '100100',
        maxAmount: '1000000',
        currencyId: 'eur',
        reward: '20'
      },
      {
        level: 3,
        minAmount: '1000100',
        maxAmount: '5000000',
        currencyId: 'eur',
        reward: '25'
      },
      {
        level: 4,
        minAmount: '5000100',
        maxAmount: '20000000',
        currencyId: 'eur',
        reward: '30'
      },
      {
        level: 5,
        minAmount: '20000100',
        maxAmount: '50000000',
        currencyId: 'eur',
        reward: '40'
      },
      {
        level: 6,
        minAmount: '50000100',
        maxAmount: '500000000',
        currencyId: 'eur',
        reward: '50'
      },
      {
        level: 7,
        minAmount: '500000100',
        maxAmount: '15000000000',
        currencyId: 'eur',
        reward: '0'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {

  }
};
