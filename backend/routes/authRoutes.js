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

// Only admins may create staff accounts
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin access required' });
  }
  next();
};

// Public routes
router.post('/client-signup', clientSignUp);
router.post('/signin', signIn);
router.get('/logout/:id', logOut);

// Staff creation — admin only (was public: anyone could create staff accounts)
router.post('/signup', passport.authenticate('jwt', { session: false }), requireAdmin, signUp);

// Protected routes (require authentication)
router.get('/users', passport.authenticate('jwt', { session: false }), getAllUsers);
router.get('/users/:id', passport.authenticate('jwt', { session: false }), getOne);
router.put('/users/:id', passport.authenticate('jwt', { session: false }), updateUserById);
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), requireAdmin, deleteUser);
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);
router.put('/profile', passport.authenticate('jwt', { session: false }), updateProfile);

// Export the router
module.exports = router;