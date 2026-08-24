const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function startServer() {
  let uri = MONGO_URI;
  let isMemory = false;

  if (!uri) {
    console.log('No MONGO_URI provided. Starting in-memory MongoDB server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    isMemory = true;
  }

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB${isMemory ? ' (In-Memory)' : ''}`);
    if (isMemory) {
      const { runSeed } = require('./seed');
      await runSeed();
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

startServer();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const slotRoutes = require('./routes/slots');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/slots', slotRoutes);

const path = require('path');
// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
