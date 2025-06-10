const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  signUp,
  clientSignUp, 
  signIn,
  logOut,
  getAllUsers,
  getProfile,
  updateProfile,
  deleteUser,
  getOne,
  updateUserById,
} = require('../controllers/AuthController');

// Public routes
router.post('/signup', signUp);
router.post('/client-signup', clientSignUp);
router.post('/signin', signIn);
router.get('/logout/:id', logOut);

// Protected routes (require authentication)
router.get('/users', passport.authenticate('jwt', { session: false }), getAllUsers);
router.get('/users/:id', passport.authenticate('jwt', { session: false }), getOne);
router.put('/users/:id', passport.authenticate('jwt', { session: false }), updateUserById);
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), deleteUser);
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);
router.put('/profile', passport.authenticate('jwt', { session: false }), updateProfile);

// Export the router
module.exports = router;