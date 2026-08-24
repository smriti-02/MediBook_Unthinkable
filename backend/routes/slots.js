const express = require('express');
const router = express.Router();
const BookingLock = require('../models/BookingLock');
const Appointment = require('../models/Appointment');

// Check if slot is taken
router.post('/check', async (req, res) => {
  try {
    const { doctorId, date, time, excludeId } = req.body;
    
    // Check appointments
    const query = {
      doctorId,
      date,
      time,
      status: { $ne: 'cancelled' }
    };
    if (excludeId) {
      query.id = { $ne: excludeId };
    }
    
    const isBooked = await Appointment.findOne(query);
    if (isBooked) {
      return res.json({ taken: true });
    }

    res.json({ taken: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Acquire lock
router.post('/lock', async (req, res) => {
  try {
    const { doctorId, date, time, userId } = req.body;
    
    // Check existing lock
    const existingLock = await BookingLock.findOne({ doctorId, date, time });
    
    if (existingLock && existingLock.userId !== userId) {
      return res.json({ success: false, message: 'Slot is currently locked by another user' });
    }

    if (existingLock && existingLock.userId === userId) {
      // Refresh lock
      existingLock.lockedAt = Date.now();
      await existingLock.save();
      return res.json({ success: true });
    }

    // Create new lock
    const newLock = new BookingLock({ doctorId, date, time, userId });
    await newLock.save();
    res.json({ success: true });
    
  } catch (err) {
    // If uniqueness constraint fails, it means another lock was just created
    if (err.code === 11000) {
      return res.json({ success: false, message: 'Slot was just locked by another user' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Release lock
router.post('/unlock', async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    await BookingLock.findOneAndDelete({ doctorId, date, time });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
