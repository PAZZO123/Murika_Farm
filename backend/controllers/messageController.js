const Message = require('../models/messageModel');

// Get messages between two users
exports.getMessages = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { receiver, content } = req.body;

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver,
      content
    });

    await newMessage.save();
    res.status(201).json({ newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
