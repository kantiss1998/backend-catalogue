const express = require("express");
const {
  getAllData,
  getCategoryById,
  getProductById,
  getColorById,
  getCategory,
  getProduct,
  getColor,
} = require("../controllers/get");
const {
  postCategory,
  postProduct,
  postColor,
} = require("../controllers/create");
const {
  deleteCategory,
  deleteColor,
  deleteProduct,
} = require("../controllers/delete");
const {
  updateCategory,
  updateColor,
  updateProduct,
} = require("../controllers/update");
const router = express.Router();

router.get("/all", getAllData);
router.get("/category", getCategory);
router.get("/product", getProduct);
router.get("/color", getColor);

router.get("/category/:id", getCategoryById);
router.get("/product/:id", getProductById);
router.get("/color/:id", getColorById);

router.post("/category", postCategory);
router.post("/color", postColor);
router.post("/product", postProduct);

router.delete("/category/:id", deleteCategory);
router.delete("/color/:id", deleteColor);
router.delete("/product/:id", deleteProduct);

router.put("/category/:id", updateCategory);
router.put("/color/:id", updateColor);
router.put("/product/:id", updateProduct);

module.exports = router;
