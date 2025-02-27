const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../Middlewares/multerConfig');

// Get all products
router.get('/', productController.getAllProducts);

// Get single product
router.get('/:id', productController.getProduct);

// Create product with image upload
router.post('/', upload.single('image'), productController.createProduct);

// Update product with optional image upload
router.put('/:id', upload.single('image'), productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;