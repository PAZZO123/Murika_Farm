const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, default: '' },
  mediaUrl:  { type: String, default: null },
  mediaType: { type: String, enum: ['text', 'image', 'video', 'document'], default: 'text' },
  fileName:  { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
