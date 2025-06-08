const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
// You might want to add authentication middleware here if you have one
// const auth = require('../middleware/auth'); // Example auth middleware

// Get all expenses
router.get('/expenses', expenseController.getAllExpenses); // No ID needed for all

// Get single expense
router.get('/expenses/:id', expenseController.getExpense);

// Create expense
router.post('/expenses', expenseController.createExpense);

// Update expense
router.put('/expenses/:id', expenseController.updateExpense);

// Delete expense
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;