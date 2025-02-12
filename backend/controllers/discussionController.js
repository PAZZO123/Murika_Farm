const Discussion = require('../models/Discussion');

// Get all discussions
exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().populate('userId', 'username');
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching discussions' });
  }
};

// Get a specific discussion by ID
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId).populate('userId', 'username');
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching discussion' });
  }
};

// Create a new discussion (either theme or forum)
exports.createDiscussion = async (req, res) => {
  try {
    const { title, description, type, hashtag, link } = req.body;
    let newDiscussion = new Discussion({
      userId: req.user._id,
      title,
      description,
      type,
      hashtag: type === 'Theme' ? hashtag : undefined,
      link: type === 'Forum' ? link : undefined
    });
    await newDiscussion.save();
    res.status(201).json(newDiscussion);
  } catch (error) {
    res.status(500).json({ error: 'Error creating discussion' });
  }
};

// Update a discussion by ID
exports.updateDiscussion = async (req, res) => {
  try {
    const { title, description } = req.body;
    let discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    discussion.title = title || discussion.title;
    discussion.description = description || discussion.description;
    discussion.updatedAt = Date.now();
    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Error updating discussion' });
  }
};

// Delete a discussion by ID
exports.deleteDiscussion = async (req, res) => {
  try {
    let discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    await discussion.deleteOne();
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting discussion' });
  }
};

// Like or unlike a discussion
exports.likeDiscussion = async (req, res) => {
  try {
    let discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const liked = discussion.likes.includes(req.user._id);
    if (liked) {
      discussion.likes.pull(req.user._id); // Unlike
    } else {
      discussion.likes.push(req.user._id); // Like
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Error liking/unliking discussion' });
  }
};

// Add a comment to a discussion
exports.addComment = async (req, res) => {
  try {
    let discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    discussion.comments.push({
      userId: req.user._id,
      content: req.body.content
    });

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
};
exports.attendDiscussion = async (req, res) => {
  try {console.log(`Looking for discussion with ID: ${req.params.id}`);
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    if (discussion.type !== 'Forum') {
      return res.status(400).json({ error: 'Attendance can only be marked for forums' });
    }

    const alreadyAttending = discussion.attendees.some(attendee => attendee.userId.equals(req.user._id));

    if (alreadyAttending) {
      return res.status(400).json({ error: 'You have already marked attendance for this forum' });
    }

    discussion.attendees.push({
      userId: req.user._id
    });

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Error marking attendance' });
  }
};

exports.getDiscussionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const discussions = await Discussion.find({ userId }).populate('userId', 'username');
    if (discussions.length === 0) {
      return res.status(404).json({ error: 'No discussions found for this user' });
    }
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching discussions by user' });
  }
};
