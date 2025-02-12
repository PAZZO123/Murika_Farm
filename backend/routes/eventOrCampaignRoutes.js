const express = require('express');
const router = express.Router();
const {
  createEventOrCampaign,
  getAllEventsOrCampaigns,
  getEventOrCampaignById,
  updateEventOrCampaign,
  deleteEventOrCampaign,
} = require('../controllers/eventOrCampaignController');

// Create a new Event or Campaign
router.post('/campaign', createEventOrCampaign);

// Get all Events or Campaigns
router.get('/campaign', getAllEventsOrCampaigns);

// Get a single Event or Campaign by ID
router.get('/campaign/:id', getEventOrCampaignById);

// Update an Event or Campaign by ID
router.put('/campaign/:id', updateEventOrCampaign);

// Delete an Event or Campaign by ID
router.delete('/campaign/:id', deleteEventOrCampaign);

module.exports = router;
