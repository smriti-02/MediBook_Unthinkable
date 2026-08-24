const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom ID from seed
  userId: { type: String, required: true, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialisation: { type: String, required: true },
  qualifications: { type: String, required: true },
  workingHours: { type: Object, required: true },
  slotDuration: { type: Number, required: true },
  leaveDays: { type: [String], default: [] },
  bio: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Doctor', doctorSchema);
