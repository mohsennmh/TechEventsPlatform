const express = require('express');
const { verifyToken, adminAuth } = require('../middleware/authMiddleware');

// Admin Controllers
const { getAllUsers, deleteUser } = require('../controllers/adminController');

const router = express.Router();

// Get all users (Admin only)
router.get('/users', verifyToken, adminAuth, getAllUsers);

// Delete a user (Admin only)
router.delete('/users/:userId', verifyToken, adminAuth, deleteUser);

module.exports = router;
