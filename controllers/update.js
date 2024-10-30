  const { Category, Product, Color } = require("../models");
  const { ImgurClient } = require('imgur');

  const client = new ImgurClient({ clientId: "5423ffa26e0f2b8" });

  class UpdateController {
    static async updateCategory(req, res, next) {
      try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        const updatedCategory = await category.update(req.body);
        res.json(updatedCategory);
      } catch (error) {
        next(error);
      }
    }

    static async updateProduct(req, res, next) {
      try {
        console.log("masuk")
        const product = await Product.findByPk(req.params.id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        const updatedProduct = await product.update(req.body);
        res.json(updatedProduct);
      } catch (error) {
        console.log(error)
      }
    }

    static async updateColor(req, res, next) {
      try {
        const color = await Color.findByPk(req.params.id);
        if (!color) {
          return res.status(404).json({ message: "Color not found" });
        }
        const updatedColor = await color.update(req.body);
        res.json(updatedColor);
      } catch (error) {
        next(error);
      }
    }

    static async updateProductImage(req, res, next) {
      try {
        console.log(req.files)
        const product = await Product.findByPk(req.params.id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
  
        // Upload multiple photos
        const photoUrls = await Promise.all(
          req.files.map(async (file) => {
            const response = await client.upload({
              image: file.buffer.toString("base64"),
              type: "base64"
            });
            return response.data.link;
          })
        );
  
        const updatedProduct = await product.update({
          imgUrls: photoUrls
        });
        res.json(updatedProduct);
      } catch (error) {
        console.log(error);
        next(error);
      }
    }

    static async updateColorImage(req, res, next) {
      try {
        const color = await Color.findByPk(req.params.id);
        if (!color) {
          return res.status(404).json({ message: "Color not found" });
        }

        console.log(req.body, req.file)
  
        // Upload single photo
        const response = await client.upload({
          image: req.file.buffer.toString("base64"),
          type: "base64"
        });
        const photoUrl = response.data.link;
  
        const updatedColor = await color.update({
          imgUrl: photoUrl
        });
        res.json(updatedColor);
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  }

  module.exports = UpdateController;