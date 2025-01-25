const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify Token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    req.user = decoded;  
    next();  
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });  
  }
};


// Organizer Authorization
const organizerAuth = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Admin Authorization
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { verifyToken, organizerAuth, adminAuth };
