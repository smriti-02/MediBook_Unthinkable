const mongoose = require('mongoose');

const bookingLockSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: String, required: true },
  lockedAt: { type: Date, default: Date.now, expires: 300 } // TTL index for 5 minutes (300 seconds)
});

bookingLockSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('BookingLock', bookingLockSchema);
