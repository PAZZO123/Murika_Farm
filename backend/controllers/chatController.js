const Chat = require("../models/Chat");
const User = require("../models/userModel");

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id; // Extracted from JWT token

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    const newMessage = new Chat({ sender: senderId, receiver: receiverId, message });
    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", chat: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Chat Messages between Admin & Employee
exports.getChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;

    const messages = await Chat.find({
      $or: [
        { sender: loggedInUserId, receiver: userId },
        { sender: userId, receiver: loggedInUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark Messages as Read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndUpdate(chatId, { isRead: true });

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Admin or Employee Chats
exports.getAllChats = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const chats = await Chat.find({ $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }] })
      .populate("sender", "firstName lastName role")
      .populate("receiver", "firstName lastName role")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
