const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findOne({ id: req.params.id });
    if (appt) {
      res.json(appt);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.params.patientId });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments by doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appts = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update appointment
router.post('/', async (req, res) => {
  try {
    const apptData = req.body;
    let appt = await Appointment.findOne({ id: apptData.id });
    if (appt) {
      Object.assign(appt, apptData);
      const updatedAppt = await appt.save();
      res.json(updatedAppt);
    } else {
      const newAppt = new Appointment(apptData);
      const savedAppt = await newAppt.save();
      res.status(201).json(savedAppt);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
