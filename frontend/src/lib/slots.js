const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getAvailableSlots(doctor, date, bookedAppointments = []) {
  const d = new Date(date);
  const dayName = DAYS[d.getDay()];
  const hours = doctor.workingHours[dayName];

  if (!hours || !hours.enabled) return [];
  if (doctor.leaveDays.includes(date)) return [];

  const slots = [];
  const [startH, startM] = hours.start.split(':').map(Number);
  const [endH, endM] = hours.end.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + doctor.slotDuration <= endMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const m = (currentMinutes % 60).toString().padStart(2, '0');
    const time = `${h}:${m}`;
    const taken = bookedAppointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled');
    slots.push({ time, available: !taken });
    currentMinutes += doctor.slotDuration;
  }

  return slots;
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getNextDays(count) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}
