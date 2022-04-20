'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const path = require('path')
    const fs = require('fs')
    const filePath = path.join(__dirname,'..','country-codes.json');
    const countriesList = [];
    if(fs.existsSync(filePath)){
      const countries = require(filePath)
      for(let i in countries){
        countriesList.push({
          code:i,
          name:countries[i]
        })
      }
    }
    await queryInterface.bulkInsert(`CountryCodes`,countriesList,{
      ignoreDuplicates: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
