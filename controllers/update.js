const { Category, Product, Color } = require("../models");
const { ImgurClient } = require("imgur");

const client = new ImgurClient({ clientId: "5423ffa26e0f2b8" });

// Utility function for delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit =
        error.status === 429 || error.message.includes("over capacity");

      if (i === maxRetries - 1) throw error;

      // Calculate delay with exponential backoff
      const delay = isRateLimit
        ? Math.min(1000 * Math.pow(2, i), 10000) // Max 10 seconds for rate limit
        : 1000 * (i + 1); // Linear backoff for other errors

      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
};

const uploadSingleImage = async (file) => {
  try {
    // Validate we have valid file data
    if (!file || (!file.buffer && !file.data)) {
      throw new Error("Invalid file data received");
    }

    // Handle different buffer formats (Koyeb vs Local)
    const imageBuffer = file.buffer || file.data;

    // Basic validation
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Invalid image data");
    }

    return retryWithBackoff(async () => {
      const response = await client.upload({
        image: imageBuffer.toString("base64"),
        type: "base64",
      });

      console.log("Imgur upload response status:", response.status);
      console.log("Imgur upload success:", response.success);

      // Handle rate limit explicitly
      if (
        response.status === 429 ||
        (typeof response.data === "string" &&
          response.data.includes("over capacity"))
      ) {
        throw {
          status: 429,
          message: "Rate limit exceeded or over capacity",
        };
      }

      // Handle empty response
      if (!response.success || !response.data) {
        throw new Error("Upload failed - empty response");
      }

      // Extract image URL
      let imageUrl = response.data.link;
      if (!imageUrl) {
        if (response.data.url) {
          imageUrl = response.data.url;
        } else if (response.data.image?.url) {
          imageUrl = response.data.image.url;
        } else if (response.data.image) {
          imageUrl = response.data.image;
        } else {
          throw new Error("No image URL in response");
        }
      }

      return imageUrl.startsWith("http") ? imageUrl : `https://${imageUrl}`;
    });
  } catch (error) {
    console.error("Upload error details:", error);
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
      console.log("masuk");
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const updatedProduct = await product.update(req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.log(error);
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
      console.log("UpdateProductImage - Request files:", req.files);

      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Handle both array of files and single file cases
      const files = Array.isArray(req.files)
        ? req.files
        : [req.files].filter(Boolean);

      if (!files.length) {
        return res.status(400).json({ message: "No image files provided" });
      }

      // Process files sequentially instead of parallel to avoid rate limits
      const validPhotoUrls = [];
      for (const file of files) {
        try {
          const imageUrl = await uploadSingleImage(file);
          if (imageUrl) validPhotoUrls.push(imageUrl);
          // Add small delay between uploads
          await sleep(1000);
        } catch (error) {
          console.error("Error uploading file:", error);
          // Continue with next file if one fails
        }
      }

      if (validPhotoUrls.length === 0) {
        return res.status(500).json({
          message:
            "Failed to upload any images successfully. Please try again later.",
          detail: "Service temporarily unavailable",
        });
      }

      // Update product with successful uploads
      const updatedProduct = await product.update({
        imgUrls: validPhotoUrls,
      });

      console.log("Product updated successfully:", {
        id: updatedProduct.id,
        urls: validPhotoUrls,
        totalUploaded: validPhotoUrls.length,
        totalAttempted: files.length,
      });

      res.json({
        ...updatedProduct.toJSON(),
        uploadStats: {
          successful: validPhotoUrls.length,
          total: files.length,
        },
      });
    } catch (error) {
      console.error("General error in updateProductImage:", error);
      next(error);
    }
  }

  static async updateColorImage(req, res, next) {
    try {
      // Debug logging
      console.log("UpdateColorImage - Request body:", req.body);
      console.log("UpdateColorImage - File:", req.file);

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

        console.log("Successfully got image URL:", imageUrl);

        const updatedColor = await color.update({
          imgUrl: imageUrl,
        });

        console.log("Color updated successfully:", updatedColor.id);
        res.json(updatedColor);
      } catch (uploadError) {
        console.error("Detailed upload error:", uploadError);

        // Handle specific error cases
        if (uploadError.message.includes("over capacity")) {
          return res.status(503).json({
            message:
              "Upload service is temporarily unavailable. Please try again later.",
            retryAfter: "30 seconds",
          });
        }

        if (uploadError.message.includes("Invalid image")) {
          return res.status(400).json({
            message: "Invalid image file provided",
            details: uploadError.message,
          });
        }

        return res.status(500).json({
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    } catch (error) {
      console.error("General error in updateColorImage:", error);
      next(error);
    }
  }

}

module.exports = UpdateController;
