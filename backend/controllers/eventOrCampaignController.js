const EventOrCampaign = require('../models/EventOrCampaign');

// Create a new Event or Campaign
exports.createEventOrCampaign = async (req, res) => {
  try {
    const { type, meetingType, date, time, location, venue } = req.body;

    const newEventOrCampaign = new EventOrCampaign({
      type,
      meetingType,
      date,
      time,
      location,
      venue,
    });

    await newEventOrCampaign.save();
    res.status(201).json({ message: 'Event or Campaign created successfully', data: newEventOrCampaign });
  } catch (error) {
    res.status(500).json({ message: 'Error creating Event or Campaign', error });
  }
};

// Get all Events or Campaigns
exports.getAllEventsOrCampaigns = async (req, res) => {
  try {
    const eventsOrCampaigns = await EventOrCampaign.find();
    res.status(200).json(eventsOrCampaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Events or Campaigns', error });
  }
};

// Get a single Event or Campaign by ID
exports.getEventOrCampaignById = async (req, res) => {
  try {
    const eventOrCampaign = await EventOrCampaign.findById(req.params.id);
    if (!eventOrCampaign) {
      return res.status(404).json({ message: 'Event or Campaign not found' });
    }
    res.status(200).json(eventOrCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Event or Campaign', error });
  }
};

// Update an Event or Campaign by ID
exports.updateEventOrCampaign = async (req, res) => {
  try {
    const updatedEventOrCampaign = await EventOrCampaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEventOrCampaign) {
      return res.status(404).json({ message: 'Event or Campaign not found' });
    }

    res.status(200).json({ message: 'Event or Campaign updated successfully', data: updatedEventOrCampaign });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Event or Campaign', error });
  }
};

// Delete an Event or Campaign by ID
exports.deleteEventOrCampaign = async (req, res) => {
  try {
    const eventOrCampaign = await EventOrCampaign.findByIdAndDelete(req.params.id);
    if (!eventOrCampaign) {
      return res.status(404).json({ message: 'Event or Campaign not found' });
    }
    res.status(200).json({ message: 'Event or Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Event or Campaign', error });
  }
};
