const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const MONGO_URI = 'mongodb://localhost:27017/medibook';

const workingHours = {
  Monday: { start: '09:00', end: '17:00', enabled: true },
  Tuesday: { start: '09:00', end: '17:00', enabled: true },
  Wednesday: { start: '09:00', end: '13:00', enabled: true },
  Thursday: { start: '09:00', end: '17:00', enabled: true },
  Friday: { start: '09:00', end: '16:00', enabled: true },
  Saturday: { start: '10:00', end: '13:00', enabled: false },
  Sunday: { start: '09:00', end: '17:00', enabled: false },
};

const adminUser = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@medibook.com',
  role: 'admin',
};

const doctorUser1 = {
  id: 'doctor-user-001',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@medibook.com',
  role: 'doctor',
  phone: '+1-555-0101',
};

const doctorUser2 = {
  id: 'doctor-user-002',
  name: 'Dr. James Okafor',
  email: 'james.okafor@medibook.com',
  role: 'doctor',
  phone: '+1-555-0102',
};

const doctorUser3 = {
  id: 'doctor-user-003',
  name: 'Dr. Priya Sharma',
  email: 'priya.sharma@medibook.com',
  role: 'doctor',
  phone: '+1-555-0103',
};

const patientUser = {
  id: 'patient-001',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'patient',
  phone: '+1-555-0201',
};

const doctor1 = {
  id: 'doctor-001',
  userId: 'doctor-user-001',
  name: 'Dr. Sarah Chen',
  email: 'sarah.chen@medibook.com',
  phone: '+1-555-0101',
  specialisation: 'Cardiology',
  qualifications: 'MBBS, MD (Cardiology), FACC',
  workingHours,
  slotDuration: 30,
  leaveDays: [],
  bio: 'Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.',
  isActive: true,
};

const doctor2 = {
  id: 'doctor-002',
  userId: 'doctor-user-002',
  name: 'Dr. James Okafor',
  email: 'james.okafor@medibook.com',
  phone: '+1-555-0102',
  specialisation: 'General Practice',
  qualifications: 'MBBS, MRCGP, DFSRH',
  workingHours: {
    ...workingHours,
    Saturday: { start: '09:00', end: '13:00', enabled: true },
  },
  slotDuration: 20,
  leaveDays: [],
  bio: 'Experienced GP providing comprehensive primary care for patients of all ages. Special interest in preventive medicine.',
  isActive: true,
};

const doctor3 = {
  id: 'doctor-003',
  userId: 'doctor-user-003',
  name: 'Dr. Priya Sharma',
  email: 'priya.sharma@medibook.com',
  phone: '+1-555-0103',
  specialisation: 'Dermatology',
  qualifications: 'MBBS, MD (Dermatology), DNB',
  workingHours: {
    ...workingHours,
    Wednesday: { start: '09:00', end: '17:00', enabled: true },
    Saturday: { start: '09:00', end: '14:00', enabled: true },
  },
  slotDuration: 25,
  leaveDays: [],
  bio: 'Dermatologist specialising in medical and cosmetic dermatology, with expertise in acne, eczema, psoriasis, and skin cancer screening.',
  isActive: true,
};

async function runSeed() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    console.log('Cleared existing users and doctors');

    // Insert users
    await User.insertMany([adminUser, doctorUser1, doctorUser2, doctorUser3, patientUser]);
    console.log('Inserted users');

    // Insert doctors
    await Doctor.insertMany([doctor1, doctor2, doctor3]);
    console.log('Inserted doctors');

    console.log('Seed complete!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

module.exports = { runSeed };
