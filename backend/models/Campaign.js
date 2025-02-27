// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  schedule: {
    daily: { type: Boolean, default: false },
    weekly: { type: Boolean, default: false },
    monthly: { type: Boolean, default: false },
    quarterly: { type: Boolean, default: false },
  },
  visits: {
    type: Number,
    default: 0,
  },
  conversions: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
