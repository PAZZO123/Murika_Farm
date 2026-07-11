const Message = require('../models/messageModel');

exports.getMessages = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId,   receiver: receiverId },
        { sender: receiverId, receiver: senderId   },
      ],
    })
      .populate('sender', 'firstName lastName role')
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { receiver, content, mediaUrl, mediaType, fileName } = req.body;
  try {
    const msg = await Message.create({
      sender:    senderId,
      receiver,
      content:   content   || '',
      mediaUrl:  mediaUrl  || null,
      mediaType: mediaType || 'text',
      fileName:  fileName  || null,
    });
    await msg.populate('sender', 'firstName lastName role');

    // Push to receiver if they are online
    const io          = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const receiverSocket = onlineUsers?.get(String(receiver));
    if (receiverSocket) {
      io.to(receiverSocket).emit('new-private-message', msg);
    }

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversationsOverview = async (req, res) => {
  const currentUserId = req.user._id;
  try {
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: currentUserId }, { receiver: currentUserId }] } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: {
              if:   { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender',
            },
          },
          lastMessage:          { $first: '$content' },
          lastMessageTimestamp: { $first: '$timestamp' },
        },
      },
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'participant',
        },
      },
      { $unwind: '$participant' },
      {
        $project: {
          _id: 0,
          user: {
            _id:       '$participant._id',
            firstName: '$participant.firstName',
            lastName:  '$participant.lastName',
            role:      '$participant.role',
          },
          lastMessage:          1,
          lastMessageTimestamp: 1,
        },
      },
      { $sort: { lastMessageTimestamp: -1 } },
    ]);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
