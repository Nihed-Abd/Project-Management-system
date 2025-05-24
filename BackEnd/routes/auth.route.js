const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'hec-secure-jwt-secret', 
    { expiresIn: '7d' }
  );
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hec-secure-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role, picture, creationDate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: role || 'user', // Default role is user
      picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      creationDate: creationDate || new Date()
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        picture: newUser.picture,
        creationDate: newUser.creationDate
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        picture: user.picture,
        creationDate: user.creationDate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get the current user's profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all users (for admin functionality)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
