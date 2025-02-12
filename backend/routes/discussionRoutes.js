const express = require('express');
const router = express.Router();
const passport = require('passport');
const discussionController = require('../controllers/discussionController');


router.get('/discussions', passport.authenticate('jwt', { session: false }), discussionController.getAllDiscussions);
router.get('/discussions/:id', passport.authenticate('jwt', { session: false }), discussionController.getDiscussionById);
router.post('/discussions', passport.authenticate('jwt', { session: false }), discussionController.createDiscussion);
router.put('/discussions/:id', passport.authenticate('jwt', { session: false }), discussionController.updateDiscussion);
router.delete('/discussions/:id', passport.authenticate('jwt', { session: false }), discussionController.deleteDiscussion);
router.post('/discussions/:id/like', passport.authenticate('jwt', { session: false }), discussionController.likeDiscussion);
router.post('/discussions/:id/comment', passport.authenticate('jwt', { session: false }), discussionController.addComment);
router.post('/discussions/:id/attend', passport.authenticate('jwt', { session: false }), discussionController.attendDiscussion);
router.get('/discussions/user/:userId', passport.authenticate('jwt', { session: false }), discussionController.getDiscussionsByUser);


module.exports = router;
