// routes/campaignRoutes.js
const express = require('express');
const { createCampaign, getCampaigns, updateCampaignStats } = require('../controllers/campaignController');
const router = express.Router();

// Route to create a new campaign
router.post('/campaigns', createCampaign);

// Route to get all campaigns
router.get('/campaigns', getCampaigns);

// Route to update campaign stats (visits, conversions)
router.put('/campaigns/:id/stats', updateCampaignStats);

module.exports = router;
