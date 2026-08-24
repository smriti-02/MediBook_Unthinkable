const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM
  type: { type: String, enum: ['consultation', 'follow-up', 'check-up'], required: true, default: 'consultation' },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'pending'], default: 'scheduled' },
  symptoms: { type: mongoose.Schema.Types.Mixed }, // Accept string or array
  notes: { type: String },
  patientEmail: { type: String },
  patientPhone: { type: String },
  doctorEmail: { type: String },
  specialisation: { type: String },
  symptomsDetail: { type: Object },
  calendarEventId: { type: String },
  notificationsSent: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Optional pre-visit & post-visit data
  preVisitSummary: { type: Object },
  postVisitSummary: { type: Object }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
