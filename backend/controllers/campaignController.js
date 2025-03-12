// controllers/campaignController.js
const Campaign = require('../models/Campaign');
const mongoose = require("mongoose");

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
    const campaigns = await Campaign.find().populate('visits.userId conversations.userId');
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

// Add a visit to a campaign
// Fix for addVisit controller function
const addVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    console.log('Received data from client:', { userId });
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    console.log('Current visits before update:', campaign.visits);
    
    // Check if visits is a valid array, if not initialize it
    if (!Array.isArray(campaign.visits)) {
      campaign.visits = [];
    }
    
    // Add the visit with the correct structure
    campaign.visits.push({ userId });
    await campaign.save();
    
    console.log('Updated visits:', campaign.visits);
    
    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error in addVisit:', error);
    res.status(400).json({ message: error.message });
  }
};
// Add a conversation to a campaign
// controllers/campaignController.js
const addConversation = async (req, res) => {
  try {
    const { id } = req.params; // Campaign ID
    const { message } = req.body; // Message from the request body
    const userId = req.user._id; // Authenticated user's ID

    // Find the campaign
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Add the conversation
    campaign.conversations.push({ userId, message });
    await campaign.save();

    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createCampaign, getCampaigns, updateCampaignStats, addVisit, addConversation };