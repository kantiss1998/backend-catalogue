'use strict';
const category = require('../data/category.json');
const product = require('../data/hijabs.json');
const product2 = require('../data/hijabs2.json')
const color = require('../data/colors.json')
const color2 = require('../data/colors2.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const dataCategory = category.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    })
    await queryInterface.bulkInsert('Categories', dataCategory, {});

    const dataProduct = product.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    })
    await queryInterface.bulkInsert('Products', dataProduct, {});

    const dataProduct2 = product2.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    })
    await queryInterface.bulkInsert('Products', dataProduct2, {});
    
    const dataColor = color.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    })
    await queryInterface.bulkInsert('Colors', dataColor, {});

    const dataColor2 = color2.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    })
    await queryInterface.bulkInsert('Colors', dataColor2, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Categories", null, {});
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("Colors", null, {});
  }
};
