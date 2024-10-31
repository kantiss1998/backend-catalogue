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
        console.log('Files received:', req.files); // Debug log
    
        const product = await Product.findByPk(req.params.id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        // Upload multiple photos with additional error handling and URL validation
        const photoUrls = await Promise.all(
          req.files.map(async (file, index) => {
            try {
              const response = await client.upload({
                image: file.buffer.toString("base64"),
                type: "base64"
              });
    
              // Debug logs
              console.log(`Response for image ${index}:`, response.data);
              console.log(`Link type for image ${index}:`, typeof response.data.link);
    
              // Validate and process the URL
              let imageUrl = response.data.link;
              
              // Handle if link is a function
              if (typeof imageUrl === 'function') {
                try {
                  imageUrl = imageUrl.toString();
                  // If the function returns [native code], try to get the URL directly
                  if (imageUrl.includes('[native code]')) {
                    imageUrl = response.data.url || response.data.image?.url || response.data.image;
                  }
                } catch (error) {
                  console.error('Error converting link to string:', error);
                }
              }
    
              // Validate final URL
              if (!imageUrl || typeof imageUrl !== 'string') {
                throw new Error(`Invalid image URL received for image ${index}`);
              }
    
              // Ensure URL starts with http/https
              if (!imageUrl.startsWith('http')) {
                imageUrl = `https://${imageUrl}`;
              }
    
              return imageUrl;
            } catch (uploadError) {
              console.error(`Error uploading image ${index}:`, uploadError);
              throw uploadError;
            }
          })
        );
    
        // Filter out any failed uploads
        const validPhotoUrls = photoUrls.filter(url => url && typeof url === 'string');
    
        if (validPhotoUrls.length === 0) {
          throw new Error('No valid image URLs were generated');
        }
    
        // Update product with validated URLs
        const updatedProduct = await product.update({
          imgUrls: validPhotoUrls
        });
    
        // Log successful update
        console.log('Product updated successfully:', updatedProduct.id);
        console.log('Saved image URLs:', validPhotoUrls);
    
        res.json(updatedProduct);
      } catch (error) {
        console.error('Error in updateProductImage:', error);
        next(error);
      }
    }

    static async updateColorImage(req, res, next) {
      try {
        console.log('Request body:', req.body);
        console.log('File received:', req.file); // Debug log
    
        const color = await Color.findByPk(req.params.id);
        if (!color) {
          return res.status(404).json({ message: "Color not found" });
        }
    
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
    
        try {
          // Upload single photo with error handling
          const response = await client.upload({
            image: req.file.buffer.toString("base64"),
            type: "base64"
          });
    
          // Debug logs
          console.log('Upload response:', response.data);
          console.log('Link type:', typeof response.data.link);
    
          // Validate and process the URL
          let imageUrl = response.data.link;
          
          // Handle if link is a function
          if (typeof imageUrl === 'function') {
            try {
              imageUrl = imageUrl.toString();
              // If the function returns [native code], try to get the URL directly
              if (imageUrl.includes('[native code]')) {
                imageUrl = response.data.url || response.data.image?.url || response.data.image;
              }
            } catch (error) {
              console.error('Error converting link to string:', error);
              throw new Error('Failed to process image URL');
            }
          }
    
          // Validate final URL
          if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('Invalid image URL received from upload service');
          }
    
          // Ensure URL starts with http/https
          if (!imageUrl.startsWith('http')) {
            imageUrl = `https://${imageUrl}`;
          }
    
          // Update color with validated URL
          const updatedColor = await color.update({
            imgUrl: imageUrl
          });
    
          // Log successful update
          console.log('Color updated successfully:', updatedColor.id);
          console.log('Saved image URL:', imageUrl);
    
          res.json(updatedColor);
        } catch (uploadError) {
          console.error('Error in image upload:', uploadError);
          return res.status(500).json({ 
            message: "Failed to upload image",
            error: uploadError.message 
          });
        }
    
      } catch (error) {
        console.error('Error in updateColorImage:', error);
        next(error);
      }
    }
  }

  module.exports = UpdateController;