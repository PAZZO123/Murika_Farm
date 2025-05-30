const express = require("express");
const router = express.Router();
const clientproductController = require("../controllers/clientproductController");
const upload = require("../Middlewares/multerConfig");

// Create a new product with image upload
router.post("/clientproducts", upload.single("image"), clientproductController.createProduct);
router.post('/clientproducts/create-payment-intent', clientproductController.createPaymentIntent);
router.post('/clientproducts/confirm-payment', clientproductController.confirmPayment);

// Get all products
router.get("/clientproducts", clientproductController.getAllProducts);

// Get a single product by ID
router.get("/clientproducts/:id", clientproductController.getProductById);

// Update a product by ID
router.put("/clientproducts/:id", upload.single("image"), clientproductController.updateProduct);
// ... existing routes ...

// Update product status
router.put("/clientproducts/:id/status", clientproductController.updateProductStatus);

router.get('/payment-status/:id', clientproductController.getPaymentStatus);
// Delete a product by ID
router.delete("/clientproducts/:id", clientproductController.deleteProduct);
router.get('/clientproducts/user/:userId', clientproductController.getProductsByUserId);

module.exports = router;
