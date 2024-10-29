"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: "categoryId" });
      Product.hasMany(models.Color, { foreignKey: "productId" });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      subName: DataTypes.STRING,
      imgUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      description: DataTypes.TEXT,
      categoryId: DataTypes.INTEGER,
      isNew: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
