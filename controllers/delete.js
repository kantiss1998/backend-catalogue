const { Category, Product, Color } = require("../models");

class DeleteController {
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      await category.destroy();
      res.status(204).json({ message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await product.destroy();
      res.status(204).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log(error)
    }
  }

  static async deleteColor(req, res, next) {
    try {
      const { id } = req.params;
      const color = await Color.findByPk(id);
      if (!color) {
        return res.status(404).json({ message: "Color not found" });
      }
      await color.destroy();
      res.status(204).json({ message: "Color deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DeleteController;