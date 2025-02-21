const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../Middlewares/authMiddleware");

// Send Message
router.post("/send", authMiddleware, chatController.sendMessage);

// Get Chat Messages between Admin & Employee
router.get("/:userId", authMiddleware, chatController.getChat);

// Mark Message as Read
router.put("/mark-read/:chatId", authMiddleware, chatController.markAsRead);

// Get All Chats for Logged-in User
router.get("/", authMiddleware, chatController.getAllChats);

module.exports = router;
