const Message = require('../models/messageModel');
const User = require('../models/userModel');

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
exports.getConversationsOverview = async (req, res) => {
  const currentUserId = req.user._id;

  try {
      const conversations = await Message.aggregate([
          {
              $match: {
                  $or: [
                      { sender: currentUserId },
                      { receiver: currentUserId }
                  ]
              }
          },
          {
              $sort: { timestamp: -1 } // Sort by most recent message first
          },
          {
              $group: {
                  _id: {
                      $cond: {
                          if: { $eq: ["$sender", currentUserId] },
                          then: "$receiver",
                          else: "$sender"
                      }
                  },
                  lastMessage: { $first: "$content" },
                  lastMessageTimestamp: { $first: "$timestamp" }
              }
          },
          {
              $lookup: {
                  from: 'users', // The collection name for your User model
                  localField: '_id',
                  foreignField: '_id',
                  as: 'participant'
              }
          },
          {
              $unwind: '$participant'
          },
          {
              $project: {
                  _id: 0,
                  user: {
                      _id: "$participant._id",
                      firstName: "$participant.firstName",
                      lastName: "$participant.lastName",
                      role: "$participant.role"
                  },
                  lastMessage: 1,
                  lastMessageTimestamp: 1
              }
          },
          {
              $sort: { lastMessageTimestamp: -1 } // Sort conversations by the latest message globally
          }
      ]);

      res.status(200).json(conversations);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
