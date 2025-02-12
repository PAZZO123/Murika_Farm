const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
  getMyPostsByUser,
  getMediaFile,
} = require('../controllers/postController');
const upload = require('../Middlewares/multerConfig'); 
const passport = require('passport');
const router = express.Router();

router.post('/posts', passport.authenticate('jwt', { session: false }), upload.single('file'), createPost);
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.put('/posts/:id', passport.authenticate('jwt', { session: false }), upload.single('file'), updatePost);
router.delete('/posts/:id', passport.authenticate('jwt', { session: false }), deletePost);
router.post('/posts/:id/like', passport.authenticate('jwt', { session: false }), likePost);
router.post('/posts/:id/comment', passport.authenticate('jwt', { session: false }), commentOnPost);
router.get('/media/:filename', getMediaFile);
router.get('/posts/user/:userId', passport.authenticate('jwt', { session: false }), getMyPostsByUser);


module.exports = router;
