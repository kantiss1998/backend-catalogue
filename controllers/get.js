const { Category, Product, Color } = require("../models");

const getAllData = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Color,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findAll();
    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const whereCondition = {};
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    const product = await Product.findAll({
      where: whereCondition,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: Color,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Category,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getColor = async (req, res) => {
  try {
    const { productId } = req.query;

    const whereCondition = {};
    if (productId) {
      whereCondition.productId = productId;
    }
    const color = await Color.findAll({
      where: whereCondition,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    });
    return res.status(200).json(color);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Product,
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Color,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: {
        model: Color,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }

    return res.status(200).json(color);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};

module.exports = {
  getAllData,
  getCategory,
  getProduct,
  getColor,
  getCategoryById,
  getProductById,
  getColorById,
};
