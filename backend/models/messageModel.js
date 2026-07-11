const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, default: '' },
  mediaUrl:  { type: String, default: null },
  mediaType: { type: String, enum: ['text', 'image', 'video', 'document', 'audio'], default: 'text' },
  fileName:  { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
