const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Function to send verification email
const sendVerificationEmail = (user, res) => {
  // Create a verification token
  const token = crypto.randomBytes(20).toString('hex');
  const verificationTokenExpiry = Date.now() + 3600000; // 1 hour expiry time

  // Store the token and its expiration time in the database
  user.verificationToken = token;
  user.verificationTokenExpiry = verificationTokenExpiry;
  user.save();

  // Create transporter using SMTP or service like SendGrid or Mailgun
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Please verify your email address',
    text: `Click the link to verify your email: 
      http://localhost:5000/api/auth/verify-email/${token}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Error sending email' });
    } else {
      console.log('Verification email sent:', info.response);
      res.status(200).json({ message: 'Verification email sent' });
    }
  });
};



// Register a user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    
    sendVerificationEmail(newUser, res);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in req.user.id
    const user = await User.findById(userId);  // Fetch full user data from the database

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return the full user data, including the name
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,  // Add the name here
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, // Assuming you also store the profile picture
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // console.log('Fetched User ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password'); // Exclude the password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) user.password = password; // Make sure to hash passwords in your User model

    const updatedUser = await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Use the authenticated user's ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;  // The path to the uploaded picture
    user.profilePicture = profilePictureUrl;  // Update the user's profile picture field

    await user.save();  // Save the updated user record

    res.status(200).json({ profilePicture: profilePictureUrl });  // Send the updated picture URL in the response
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture.' });
  }
};

// Fetch events that the user has RSVP'd to
exports.getRSVPedEvents = async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated token

  try {
    // Find all events where the user is in the attendees array
    const events = await Event.find({ attendees: userId });

    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No RSVP\'d events found for this user' });
    }

    res.status(200).json(events); // Return the RSVP'd events as a JSON response
  } catch (err) {
    console.error('Error fetching RSVP\'d events:', err);
    res.status(500).json({ message: 'Server error while fetching RSVP\'d events' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Find the user based on the token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update the user to mark email as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after use
    user.verificationTokenExpiry = undefined; // Clear the expiry time
    await user.save();

    res.status(200).json({ message: 'Email successfully verified!' });
  } catch (err) {
    console.error('Error during email verification:', err);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetURL}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending reset email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password reset email sent!' });
    });
    console.log("reset pass link: ",resetURL);
    console.log("reset pass token: ",resetToken);
  } catch (err) {
    console.error('Error during forgot password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;  // Get the token from the URL params
  const { newPassword } = req.body;  // Get the new password from the body

  try {
    // Find user with valid reset token and valid expiry time
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },  // Check if the token has not expired
    });

    // Check if user exists and the token is valid
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;  // Update the user's password
    user.resetPasswordToken = undefined;  // Clear the reset token
    user.resetPasswordTokenExpiry = undefined;  // Clear the token expiry date

    // Save the updated user record to the database
    await user.save();

    res.status(200).json({ message: 'Password successfully reset!' });
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
