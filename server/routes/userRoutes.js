const express = require('express');
const upload = require('../config/multer');
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUser,
  updateUserProfile,
  getRSVPedEvents,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser); // Register
router.post('/login', loginUser); // Login
router.get('/rsvp-events', verifyToken, getRSVPedEvents); // Get RSVP'd events
router.get('/me', verifyToken, getUser); // Get user profile
router.get('/profile', verifyToken, getUserProfile);
router.post('/update-profile', verifyToken, updateUserProfile); // Update user profile
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

router.post('/forgot-password',  forgotPassword); // Forgot password
router.post('/reset-password', resetPassword); // Reset password

module.exports = router;
