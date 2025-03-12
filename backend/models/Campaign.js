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
  status: {
    type: String,
    enum: ["active", "inactive", "completed", "paused"],
    default: "active",
  },
  visits: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    }],
    default: [],  // Initialize as empty array by default
  },
  conversations: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }],
    default: [],  // Initialize as empty array by default
  },
  conversions: {
    type: String,
    
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);