import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Users
export const getUsers = async () => (await axios.get(`${API_URL}/users`)).data;
export const saveUser = async (user) => (await axios.post(`${API_URL}/users`, user)).data;
export const getUserByEmail = async (email) => (await axios.get(`${API_URL}/users/email/${email}`)).data;

// Doctors
export const getDoctors = async () => (await axios.get(`${API_URL}/doctors`)).data;
export const getDoctorById = async (id) => (await axios.get(`${API_URL}/doctors/${id}`)).data;
export const saveDoctor = async (doctor) => (await axios.post(`${API_URL}/doctors`, doctor)).data;
export const deleteDoctor = async (id) => (await axios.delete(`${API_URL}/doctors/${id}`)).data;

// Appointments
export const getAppointments = async () => (await axios.get(`${API_URL}/appointments`)).data;
export const getAppointmentsByPatient = async (patientId) => (await axios.get(`${API_URL}/appointments/patient/${patientId}`)).data;
export const getAppointmentsByDoctor = async (doctorId) => (await axios.get(`${API_URL}/appointments/doctor/${doctorId}`)).data;
export const getAppointmentById = async (id) => (await axios.get(`${API_URL}/appointments/${id}`)).data;
export const saveAppointment = async (appt) => (await axios.post(`${API_URL}/appointments`, appt)).data;

// Slots
export const isSlotTaken = async (doctorId, date, time, excludeId) => (await axios.post(`${API_URL}/slots/check`, { doctorId, date, time, excludeId })).data.taken;
export const acquireLock = async (doctorId, date, time, userId) => (await axios.post(`${API_URL}/slots/lock`, { doctorId, date, time, userId })).data.success;
export const releaseLock = async (doctorId, date, time) => (await axios.post(`${API_URL}/slots/unlock`, { doctorId, date, time })).data.success;

// Notifications
export const getNotifications = async () => (await axios.get(`${API_URL}/notifications`)).data;
export const getUserNotifications = async (userId) => (await axios.get(`${API_URL}/notifications/user/${userId}`)).data;
export const saveNotification = async (n) => (await axios.post(`${API_URL}/notifications`, n)).data;
export const markNotificationRead = async (id) => (await axios.patch(`${API_URL}/notifications/${id}/read`)).data;
export const markAllNotificationsRead = async (userId) => (await axios.patch(`${API_URL}/notifications/user/${userId}/read`)).data;

// Auth
export const login = async (email) => (await axios.post(`${API_URL}/auth/login`, { email })).data;
export const register = async (userData) => (await axios.post(`${API_URL}/auth/register`, userData)).data;
