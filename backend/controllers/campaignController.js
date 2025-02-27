// controllers/campaignController.js
const Campaign = require('../models/Campaign');

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    const { title, startDate, endDate, description, schedule } = req.body;
    const newCampaign = new Campaign({ title, startDate, endDate, description, schedule });
    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a campaign's stats (visits and conversions)
const updateCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { visits, conversions } = req.body;
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.visits = visits;
    campaign.conversions = conversions;
    await campaign.save();

    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createCampaign, getCampaigns, updateCampaignStats };
