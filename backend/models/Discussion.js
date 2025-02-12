const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const attendeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdAt: { type: Date, default: Date.now } 
});

const discussionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  title: String,
  description: String,
  type: { type: String, enum: ['Theme', 'Forum'], required: true }, 
  hashtag: { type: String, required: function() { return this.type === 'Theme'; } }, 
  link: { type: String, required: function() { return this.type === 'Forum'; } }, 
  comments: [commentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendees: [attendeeSchema],  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discussion', discussionSchema);
