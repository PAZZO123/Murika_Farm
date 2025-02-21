// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const expenseController = require('../controllers/expenseController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new expense with file upload
router.post('/expenses', upload.single('attachment'), expenseController.createExpense);

// Get all expenses
router.get('/expenses', expenseController.getAllExpenses);

// Get a single expense by ID
router.get('/expenses/:id', expenseController.getExpenseById);

// Update an expense
router.put('/expenses/:id', upload.single('attachment'), expenseController.updateExpense);

// Delete an expense
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;
