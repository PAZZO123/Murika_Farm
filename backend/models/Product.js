// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number, // Changed to Number for better validation
    required: true,
  },
  isKG: {
    type: Boolean,
    default: false,
  },
  isDozen: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number, // Changed to Number for better validation
    required: true,
  },
  image: {
    type: String,
    default: "/api/placeholder/100/100"
  },
  dateRecorded: {
    type: Date,
    default: Date.now
  },
  salesPerDay: {
    type: Number,
    default: 0
  },
  expectedSales: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;