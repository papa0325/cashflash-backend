/*eslint-disable*/
const d = new Date();
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Currencies', [
    {
      id: 'eur',
      fullTitle: 'EUR',
      decimals: 2,
      currentRate: 0,
      symbol: 'EUR',
      fiat: true,
      createdAt: d,
      updatedAt: d
    },
    {
      id: 'btc',
      fullTitle: 'Bitcoin',
      decimals: 8,
      currentRate: 0,
      symbol: 'BTC',
      fiat: false,
      createdAt: d,
      updatedAt: d
    },
    {
      id: 'eth',
      fullTitle: 'Ethereum',
      decimals: 18,
      currentRate: 0,
      symbol: 'ETH',
      fiat: false,
      createdAt: d,
      updatedAt: d
    }
    ], {
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Currencies', {
      id: { [Sequelize.Op.in]: ['eur'] }
    });
  }
};
