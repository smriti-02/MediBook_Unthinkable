import { saveNotification } from './api';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function sendBookingConfirmation(appt) {
  const base = {
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };

  await saveNotification({
    ...base,
    id: uid(),
    userId: appt.patientId,
    type: 'booking_confirmation',
    title: 'Appointment Confirmed',
    message: `Your appointment with ${appt.doctorName} (${appt.specialisation}) is confirmed for ${appt.date} at ${appt.time}. A calendar invite has been sent to ${appt.patientEmail}.`,
  });

  const doctor = appt.doctorId;
  await saveNotification({
    ...base,
    id: uid(),
    userId: `doctor-user-${doctor.replace('doctor-', '')}`,
    type: 'booking_confirmation',
    title: 'New Appointment Booked',
    message: `${appt.patientName} has booked an appointment on ${appt.date} at ${appt.time}. Pre-visit symptom summary is available.`,
  });
}

export async function sendCancellationNotice(appt, reason) {
  const base = {
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };

  await saveNotification({
    ...base,
    id: uid(),
    userId: appt.patientId,
    type: 'cancellation',
    title: 'Appointment Cancelled',
    message: `Your appointment with ${appt.doctorName} on ${appt.date} at ${appt.time} has been cancelled.${reason ? ' Reason: ' + reason : ''}`,
  });

  await saveNotification({
    ...base,
    id: uid(),
    userId: `doctor-user-${appt.doctorId.replace('doctor-', '')}`,
    type: 'cancellation',
    title: 'Appointment Cancelled',
    message: `Appointment with ${appt.patientName} on ${appt.date} at ${appt.time} has been cancelled.`,
  });
}

export async function sendDoctorLeaveNotice(appt) {
  await saveNotification({
    id: uid(),
    userId: appt.patientId,
    type: 'doctor_leave',
    title: 'Appointment Affected by Doctor Leave',
    message: `Your appointment with ${appt.doctorName} on ${appt.date} has been cancelled due to the doctor being on leave. Please rebook at a different date.`,
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  });
}

export async function sendPostVisitSummaryNotice(appt) {
  await saveNotification({
    id: uid(),
    userId: appt.patientId,
    type: 'post_visit_summary',
    title: 'Your Visit Summary is Ready',
    message: `Dr. ${appt.doctorName} has completed your visit summary. Please review your medication schedule and follow-up instructions.`,
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  });
}

export async function scheduleMedicationReminders(appt) {
  if (!appt.prescription || appt.prescription.length === 0) return;
  
  for (const med of appt.prescription) {
    await saveNotification({
      id: uid(),
      userId: appt.patientId,
      type: 'medication_reminder',
      title: `Medication Reminder: ${med.medication}`,
      message: `Take ${med.medication} ${med.dosage} — ${med.frequency}. ${med.instructions}`,
      read: false,
      createdAt: new Date().toISOString(),
      appointmentId: appt.id,
    });
  }
}

export async function simulateCalendarEvent(appt) {
  const eventId = `gcal_${appt.id}_${Date.now()}`;
  console.log(`[Calendar] Created event ${eventId} for appointment ${appt.id} on ${appt.date} at ${appt.time}`);
  return eventId;
}

export async function simulateEmail(to, subject, body) {
  console.log(`[Email] To: ${to} | Subject: ${subject}`);
  console.log(`[Email] Body: ${body}`);
}
