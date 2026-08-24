const KEYS = {
  CURRENT_USER: 'medibook_current_user',
  USERS: 'medibook_users',
  DOCTORS: 'medibook_doctors',
  APPOINTMENTS: 'medibook_appointments',
  NOTIFICATIONS: 'medibook_notifications',
  BOOKING_LOCKS: 'medibook_booking_locks',
};

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Current User
export const getCurrentUser = () => {
  try {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};
export const setCurrentUser = (user) => {
  if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  else localStorage.removeItem(KEYS.CURRENT_USER);
};

// Users
export const getUsers = () => get(KEYS.USERS);
export const saveUser = (user) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user; else users.push(user);
  set(KEYS.USERS, users);
};
export const getUserByEmail = (email) =>
  getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

// Doctors
export const getDoctors = () => get(KEYS.DOCTORS);
export const saveDoctor = (doctor) => {
  const doctors = getDoctors();
  const idx = doctors.findIndex(d => d.id === doctor.id);
  if (idx >= 0) doctors[idx] = doctor; else doctors.push(doctor);
  set(KEYS.DOCTORS, doctors);
};
export const getDoctorById = (id) =>
  getDoctors().find(d => d.id === id);
export const deleteDoctor = (id) => {
  set(KEYS.DOCTORS, getDoctors().filter(d => d.id !== id));
};

// Appointments
export const getAppointments = () => get(KEYS.APPOINTMENTS);
export const saveAppointment = (appt) => {
  const appts = getAppointments();
  const idx = appts.findIndex(a => a.id === appt.id);
  if (idx >= 0) appts[idx] = appt; else appts.push(appt);
  set(KEYS.APPOINTMENTS, appts);
};
export const getAppointmentById = (id) =>
  getAppointments().find(a => a.id === id);
export const getAppointmentsByPatient = (patientId) =>
  getAppointments().filter(a => a.patientId === patientId);
export const getAppointmentsByDoctor = (doctorId) =>
  getAppointments().filter(a => a.doctorId === doctorId);

// Slot conflict check
export const isSlotTaken = (doctorId, date, time, excludeId) => {
  return getAppointments().some(a =>
    a.doctorId === doctorId &&
    a.date === date &&
    a.time === time &&
    a.status !== 'cancelled' &&
    a.id !== excludeId
  );
};

// Booking locks (slot hold mechanism, 5-minute TTL)
export const acquireLock = (doctorId, date, time, userId) => {
  const locks = get(KEYS.BOOKING_LOCKS);
  const now = Date.now();
  const key = `${doctorId}_${date}_${time}`;
  const active = locks.filter(l => now - l.lockedAt < 5 * 60 * 1000);
  const existing = active.find(l => `${l.doctorId}_${l.date}_${l.time}` === key);
  if (existing && existing.userId !== userId) return false;
  const updated = active.filter(l => `${l.doctorId}_${l.date}_${l.time}` !== key);
  updated.push({ doctorId, date, time, lockedAt: now, userId });
  set(KEYS.BOOKING_LOCKS, updated);
  return true;
};

export const releaseLock = (doctorId, date, time) => {
  const locks = get(KEYS.BOOKING_LOCKS);
  set(KEYS.BOOKING_LOCKS, locks.filter(l => !(l.doctorId === doctorId && l.date === date && l.time === time)));
};

// Notifications
export const getNotifications = () => get(KEYS.NOTIFICATIONS);
export const getUserNotifications = (userId) =>
  getNotifications().filter(n => n.userId === userId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
export const saveNotification = (n) => {
  const ns = getNotifications();
  ns.push(n);
  set(KEYS.NOTIFICATIONS, ns);
};
export const markNotificationRead = (id) => {
  const ns = getNotifications();
  const n = ns.find(n => n.id === id);
  if (n) { n.read = true; set(KEYS.NOTIFICATIONS, ns); }
};
export const markAllNotificationsRead = (userId) => {
  const ns = getNotifications().map(n => n.userId === userId ? { ...n, read: true } : n);
  set(KEYS.NOTIFICATIONS, ns);
};
