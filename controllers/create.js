const { Category, Product, Color } = require("../models");

class CreateController {
  static async postCategory(req, res, next) {
    try {
      const { name } = req.body;
      const category = await Category.create({ name });
      return res.status(201).json(category);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
  static async postProduct(req, res, next) {
    try {
      const { name, subName, description, categoryId } = req.body;
      const product = await Product.create({
        name,
        subName,
        imgUrls: ["-", "-", "-", "-"],
        description,
        categoryId,
        isNew: false,
      });
      return res.status(201).json(product);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
  static async postColor(req, res, next) {
    try {
      const { name, hexCode, productId } = req.body;
      let imgUrl = req.body.imgUrl || "-"
      const color = await Color.create({
        name,
        hexCode,
        rgb: "-",
        imgUrl,
        productId,
      });
      return res.status(201).json(color);
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
}

module.exports = CreateController;
