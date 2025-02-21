const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
    {
  supplier: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  attachment: { type: String, required: false }, // File path
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;