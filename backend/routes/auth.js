const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login Route (Mock behavior matching frontend)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const id = `${role}-${Date.now()}`;
    user = new User({
      id,
      name,
      email: email.toLowerCase(),
      role,
      phone
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
