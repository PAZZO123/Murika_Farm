const mongoose = require('mongoose');

const CaseReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportAs: {
    type: String,
    enum: ['Adult', 'Child'],
    required: true,
  },
  typeOfAbuse: {
    type: String,
    enum: ['Sexual', 'Physical', 'Emotional'],
    required: true,
  },
  abusedChildName: {
    type: String,
    required: true,
  },
  abusedChildAge: {
    type: Number,
    required: true,
  },
  abusedChildAddress: {
    type: String,
    required: true,
  },
  guardianName: {
    type: String,
    required: true,
  },
  guardianAddress: {
    type: String,
    required: true,
  },
  caseSuspectName: {
    type: String,
    required: true,
  },
  caseSuspectAge: {
    type: Number,
    required: true,
  },
  caseSuspectRelation: {
    type: String,
    enum: ['Yes', 'No'],
    required: true,
  },
  caseSuspectAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reported'],
    default: 'pending',
  },
}, { timestamps: true });

const CaseReport = mongoose.model('CaseReport', CaseReportSchema);

module.exports = CaseReport;
