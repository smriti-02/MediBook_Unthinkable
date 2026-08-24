const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update a user (upsert)
router.post('/', async (req, res) => {
  try {
    const { id, name, email, role, phone, createdAt } = req.body;
    let user = await User.findOne({ id });
    if (user) {
      user.name = name;
      user.email = email.toLowerCase();
      user.role = role;
      user.phone = phone;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      const newUser = new User({ id, name, email: email.toLowerCase(), role, phone, createdAt });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
