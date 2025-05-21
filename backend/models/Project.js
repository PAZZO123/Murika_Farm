const mongoose = require('mongoose');
const User = require('../models/userModel'); 

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Ongoing", "Completed","Todo"], 
    default: "Todo",
   
  },
  description: {
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
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
    },
  ],
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
