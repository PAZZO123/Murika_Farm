const GroupMessage = require('../models/GroupMessage');

exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await GroupMessage.find()
      .populate('sender', 'firstName lastName role')
      .sort({ createdAt: 1 })
      .limit(300);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType, fileName } = req.body;
    const msg = await GroupMessage.create({
      sender:    req.user._id,
      content:   content || '',
      mediaUrl:  mediaUrl  || null,
      mediaType: mediaType || 'text',
      fileName:  fileName  || null,
    });
    await msg.populate('sender', 'firstName lastName role');
    // Broadcast to every connected client
    req.app.get('io').emit('new-group-message', msg);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
