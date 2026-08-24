const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ id: req.params.id });
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update doctor
router.post('/', async (req, res) => {
  try {
    const doctorData = req.body;
    let doctor = await Doctor.findOne({ id: doctorData.id });
    if (doctor) {
      Object.assign(doctor, doctorData);
      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      const newDoctor = new Doctor(doctorData);
      const savedDoctor = await newDoctor.save();
      res.status(201).json(savedDoctor);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ id: req.params.id });
    if (doctor) {
      res.json({ message: 'Doctor deleted' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
