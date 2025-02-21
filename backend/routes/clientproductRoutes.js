// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const clientproductController = require("../controllers/clientproductController");

// Create a new product
router.post("/clientproducts", clientproductController.createProduct);

// Get all products
router.get("/clientproducts", clientproductController.getAllProducts);

// Get a single product by ID
router.get("/clientproducts/:id", clientproductController.getProductById);

// Update a product by ID
router.put("/clientproducts/:id", clientproductController.updateProduct);

// Delete a product by ID
router.delete("/clientproducts/:id", clientproductController.deleteProduct);

module.exports = router;