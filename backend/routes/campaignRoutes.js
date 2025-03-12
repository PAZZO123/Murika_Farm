// routes/campaignRoutes.js
const express = require('express');
const { createCampaign, getCampaigns, updateCampaignStats, addVisit, addConversation } = require('../controllers/campaignController');
const router = express.Router();
const passport = require('passport');

// Route to create a new campaign
router.post('/campaigns', createCampaign);

// Route to get all campaigns
router.get('/campaigns', getCampaigns);

// Route to update campaign stats (visits, conversions)
router.put('/campaigns/:id/stats', updateCampaignStats);

// Route to add a visit to a campaign
router.post('/campaigns/:id/visits', addVisit);

// Route to add a conversation to a campaign
router.post('/campaigns/:id/conversations', passport.authenticate('jwt', { session: false }), addConversation);

module.exports = router;