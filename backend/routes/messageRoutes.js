const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/messages/:receiverId', passport.authenticate('jwt', { session: false }), messageController.getMessages);
router.post('/messages',  passport.authenticate('jwt', { session: false }), messageController.sendMessage);

module.exports = router;
