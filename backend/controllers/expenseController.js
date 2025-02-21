// controllers/expenseController.js
const Expense = require("../models/Expense");

// Create a new expense with file upload
exports.createExpense = async (req, res) => {
  try {
    const { supplier, date, amount } = req.body;
    const attachment = req.file ? req.file.path : null;

    const newExpense = new Expense({ supplier, date, amount, attachment });
    await newExpense.save();

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error: error.message });
  }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};

// Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
    try {
      const { id } = req.params;
      const { supplier, date, amount } = req.body;
      let attachment = req.file ? req.file.path : null; // If a new attachment is uploaded
  
      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        { supplier, date, amount, attachment },
        { new: true }
      );
  
      res.status(200).json(updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).send('Server error');
    }
  };

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};