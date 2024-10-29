  const { Category, Product, Color } = require("../models");
  const imgur = require('imgur');

  async function uploadImageToImgur(imagePath) {
    try {
      const response = await imgur.uploadFile(imagePath);
      return response.data.link;
    } catch (error) {
      throw new Error('Failed to upload image to Imgur');
    }
  }

  class UpdateController {

    static async uploadFotoProduct(req, res, next) {
      try {
        const { productId, imageIndex } = req.body;
        
        // Validasi request
        if (!req.file && !req.body.imageUrl) {
          return res.status(400).json({ message: "No image provided" });
        }
  
        const product = await Product.findByPk(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
  
        if (imageIndex < 0 || imageIndex > 3) {
          return res.status(400).json({ message: "Invalid image index (must be 0-3)" });
        }
  
        // Jika imgUrls belum ada, inisialisasi sebagai array
        if (!product.imgUrls) {
          product.imgUrls = [];
        }
  
        // Upload gambar atau gunakan URL yang diberikan
        if (req.file) {
          try {
            const uploadedImageUrl = await uploadImageToImgur(req.file.path);
            product.imgUrls[imageIndex] = uploadedImageUrl;
          } catch (error) {
            return res.status(500).json({ message: "Failed to upload image", error: error.message });
          }
        } else if (req.body.imageUrl) {
          product.imgUrls[imageIndex] = req.body.imageUrl;
        }
  
        await product.save();
        res.json({ 
          message: "Image uploaded successfully",
          product 
        });
      } catch (error) {
        next(error);
      }
    }
  
    static async uploadFotoColor(req, res, next) {
      try {
        const { colorId } = req.body;
        
        // Validasi request
        if (!req.file && !req.body.imageUrl) {
          return res.status(400).json({ message: "No image provided" });
        }
  
        const color = await Color.findByPk(colorId);
        if (!color) {
          return res.status(404).json({ message: "Color not found" });
        }
  
        // Upload gambar atau gunakan URL yang diberikan
        if (req.file) {
          try {
            const uploadedImageUrl = await uploadImageToImgur(req.file.path);
            color.imgUrl = uploadedImageUrl;
          } catch (error) {
            return res.status(500).json({ message: "Failed to upload image", error: error.message });
          }
        } else if (req.body.imageUrl) {
          color.imgUrl = req.body.imageUrl;
        }
  
        await color.save();
        res.json({ 
          message: "Image uploaded successfully",
          color 
        });
      } catch (error) {
        next(error);
      }
    }  
    
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
  }

  module.exports = UpdateController;