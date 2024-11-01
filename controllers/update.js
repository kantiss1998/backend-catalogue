  const { Category, Product, Color } = require("../models");
  const { ImgurClient } = require('imgur');

  const client = new ImgurClient({ clientId: "5423ffa26e0f2b8" });

  const validateImageData = (buffer) => {
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid image data');
    }
    // Add basic image validation
    const signature = buffer.toString('hex', 0, 4);
    const validSignatures = [
      'ffd8ffe0', // JPEG
      '89504e47', // PNG
      '47494638'  // GIF
    ];
    
    if (!validSignatures.some(sig => signature.startsWith(sig))) {
      throw new Error('Invalid image format');
    }
    
    return true;
  };

  const uploadSingleImage = async (file) => {
    try {
      // Validate we have valid file data
      if (!file || (!file.buffer && !file.data)) {
        throw new Error('Invalid file data received');
      }
  
      // Handle different buffer formats (Koyeb vs Local)
      const imageBuffer = file.buffer || file.data;
      
      // Basic validation
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Invalid image data');
      }
  
      const response = await client.upload({
        image: imageBuffer.toString("base64"),
        type: "base64"
      });
  
      console.log('Imgur upload response:', response);
  
      if (!response?.data?.link) {
        throw new Error('Invalid response from Imgur');
      }
  
      let imageUrl = response.data.link;
  
      // Handle various URL formats
      if (typeof imageUrl === 'function' || !imageUrl) {
        // Try alternative URL fields
        imageUrl = response.data.url || 
                  response.data.image?.url || 
                  response.data.image;
                  
        if (!imageUrl) {
          console.error('Full Imgur response:', JSON.stringify(response.data, null, 2));
          throw new Error('Could not extract valid image URL from response');
        }
      }
  
      // Ensure URL starts with https
      return imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

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
  
    static async updateColorImage(req, res, next) {
      try {
        // Debug logging
        console.log('UpdateColorImage - Request body:', req.body);
        console.log('UpdateColorImage - File:', req.file);
        
        const color = await Color.findByPk(req.params.id);
        if (!color) {
          return res.status(404).json({ message: "Color not found" });
        }
  
        // Check for file in different possible locations
        const uploadFile = req.file || (req.files && req.files[0]);
        
        if (!uploadFile) {
          return res.status(400).json({ message: "No image file provided" });
        }
  
        try {
          const imageUrl = await uploadSingleImage(uploadFile);
          
          console.log('Successfully got image URL:', imageUrl);
  
          const updatedColor = await color.update({
            imgUrl: imageUrl
          });
  
          console.log('Color updated successfully:', updatedColor.id);
          res.json(updatedColor);
        } catch (uploadError) {
          console.error('Detailed upload error:', uploadError);
          
          // Handle specific error cases
          if (uploadError.message.includes('over capacity')) {
            return res.status(503).json({
              message: "Upload service is temporarily unavailable. Please try again later.",
              retryAfter: "30 seconds"
            });
          }
  
          if (uploadError.message.includes('Invalid image')) {
            return res.status(400).json({
              message: "Invalid image file provided",
              details: uploadError.message
            });
          }
  
          return res.status(500).json({ 
            message: "Failed to upload image",
            error: uploadError.message
          });
        }
      } catch (error) {
        console.error('General error in updateColorImage:', error);
        next(error);
      }
    }
  
    static async updateProductImage(req, res, next) {
      try {
        console.log('UpdateProductImage - Request files:', req.files);
        
        const product = await Product.findByPk(req.params.id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
  
        // Handle both array of files and single file cases
        const files = Array.isArray(req.files) ? req.files : [req.files].filter(Boolean);
        
        if (!files.length) {
          return res.status(400).json({ message: "No image files provided" });
        }
  
        // Upload multiple photos
        const uploadPromises = files.map(async (file) => {
          try {
            return await uploadSingleImage(file);
          } catch (error) {
            console.error('Error uploading file:', error);
            return null;
          }
        });
  
        const photoUrls = await Promise.all(uploadPromises);
        const validPhotoUrls = photoUrls.filter(url => url);
  
        if (validPhotoUrls.length === 0) {
          return res.status(500).json({
            message: 'Failed to upload any images successfully'
          });
        }
  
        // Update product with successful uploads
        const updatedProduct = await product.update({
          imgUrls: validPhotoUrls
        });
  
        console.log('Product updated successfully:', {
          id: updatedProduct.id,
          urls: validPhotoUrls
        });
  
        res.json(updatedProduct);
      } catch (error) {
        console.error('General error in updateProductImage:', error);
        next(error);
      }
    }

    // static async updateProductImage(req, res, next) {
    //   try {
    //     console.log('Files received:', req.files); // Debug log
    
    //     const product = await Product.findByPk(req.params.id);
    //     if (!product) {
    //       return res.status(404).json({ message: "Product not found" });
    //     }
    
    //     // Upload multiple photos with additional error handling and URL validation
    //     const photoUrls = await Promise.all(
    //       req.files.map(async (file, index) => {
    //         try {
    //           const response = await client.upload({
    //             image: file.buffer.toString("base64"),
    //             type: "base64"
    //           });
    
    //           // Debug logs
    //           console.log(`Response for image ${index}:`, response.data);
    //           console.log(`Link type for image ${index}:`, typeof response.data.link);
    
    //           // Validate and process the URL
    //           let imageUrl = response.data.link;
              
    //           // Handle if link is a function
    //           if (typeof imageUrl === 'function') {
    //             try {
    //               imageUrl = imageUrl.toString();
    //               // If the function returns [native code], try to get the URL directly
    //               if (imageUrl.includes('[native code]')) {
    //                 imageUrl = response.data.url || response.data.image?.url || response.data.image;
    //               }
    //             } catch (error) {
    //               console.error('Error converting link to string:', error);
    //             }
    //           }
    
    //           // Validate final URL
    //           if (!imageUrl || typeof imageUrl !== 'string') {
    //             throw new Error(`Invalid image URL received for image ${index}`);
    //           }
    
    //           // Ensure URL starts with http/https
    //           if (!imageUrl.startsWith('http')) {
    //             imageUrl = `https://${imageUrl}`;
    //           }
    
    //           return imageUrl;
    //         } catch (uploadError) {
    //           console.error(`Error uploading image ${index}:`, uploadError);
    //           throw uploadError;
    //         }
    //       })
    //     );
    
    //     // Filter out any failed uploads
    //     const validPhotoUrls = photoUrls.filter(url => url && typeof url === 'string');
    
    //     if (validPhotoUrls.length === 0) {
    //       throw new Error('No valid image URLs were generated');
    //     }
    
    //     // Update product with validated URLs
    //     const updatedProduct = await product.update({
    //       imgUrls: validPhotoUrls
    //     });
    
    //     // Log successful update
    //     console.log('Product updated successfully:', updatedProduct.id);
    //     console.log('Saved image URLs:', validPhotoUrls);
    
    //     res.json(updatedProduct);
    //   } catch (error) {
    //     console.error('Error in updateProductImage:', error);
    //     next(error);
    //   }
    // }

    // static async updateColorImage(req, res, next) {
    //   try {
    //     console.log('Request body:', req.body);
    //     console.log('File received:', req.file); // Debug log
    
    //     const color = await Color.findByPk(req.params.id);
    //     if (!color) {
    //       return res.status(404).json({ message: "Color not found" });
    //     }
    
    //     if (!req.file) {
    //       return res.status(400).json({ message: "No image file provided" });
    //     }
    
    //     try {
    //       // Upload single photo with error handling
    //       const response = await client.upload({
    //         image: req.file.buffer.toString("base64"),
    //         type: "base64"
    //       });
    
    //       // Debug logs
    //       console.log('Upload response:', response.data);
    //       console.log('Link type:', typeof response.data.link);
    
    //       // Validate and process the URL
    //       let imageUrl = response.data.link;
          
    //       // Handle if link is a function
    //       if (typeof imageUrl === 'function') {
    //         try {
    //           imageUrl = imageUrl.toString();
    //           // If the function returns [native code], try to get the URL directly
    //           if (imageUrl.includes('[native code]')) {
    //             imageUrl = response.data.url || response.data.image?.url || response.data.image;
    //           }
    //         } catch (error) {
    //           console.error('Error converting link to string:', error);
    //           throw new Error('Failed to process image URL');
    //         }
    //       }
    
    //       // Validate final URL
    //       if (!imageUrl || typeof imageUrl !== 'string') {
    //         throw new Error('Invalid image URL received from upload service');
    //       }
    
    //       // Ensure URL starts with http/https
    //       if (!imageUrl.startsWith('http')) {
    //         imageUrl = `https://${imageUrl}`;
    //       }
    
    //       // Update color with validated URL
    //       const updatedColor = await color.update({
    //         imgUrl: imageUrl
    //       });
    
    //       // Log successful update
    //       console.log('Color updated successfully:', updatedColor.id);
    //       console.log('Saved image URL:', imageUrl);
    
    //       res.json(updatedColor);
    //     } catch (uploadError) {
    //       console.error('Error in image upload:', uploadError);
    //       return res.status(500).json({ 
    //         message: "Failed to upload image",
    //         error: uploadError.message 
    //       });
    //     }
    
    //   } catch (error) {
    //     console.error('Error in updateColorImage:', error);
    //     next(error);
    //   }
    // }
    
  }

  module.exports = UpdateController;