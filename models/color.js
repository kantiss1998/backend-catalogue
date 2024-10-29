'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Color.belongsTo(models.Product, { foreignKey: "productId" });
    }
  }
  Color.init({
    name: DataTypes.STRING,
    hexCode: DataTypes.STRING,
    rgb: DataTypes.STRING,
    imgUrl: DataTypes.STRING,
    productId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Color',
  });
  return Color;
};