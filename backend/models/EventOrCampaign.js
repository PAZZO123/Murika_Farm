const mongoose = require('mongoose');

const eventOrCampaignSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Campaign', 'Event'],
    required: true,
  },
  meetingType: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventOrCampaign = mongoose.model('EventOrCampaign', eventOrCampaignSchema);
module.exports = EventOrCampaign;
