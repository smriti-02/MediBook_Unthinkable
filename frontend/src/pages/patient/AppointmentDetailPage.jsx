import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentById, saveAppointment  } from '@/lib/api';
import { sendCancellationNotice } from '@/lib/notifications';
import { formatDate, formatTime } from '@/lib/slots';
import { Calendar, Search, ClipboardList, ChevronLeft, Brain, Pill, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/features/StatusBadge';
import UrgencyBadge from '@/components/features/UrgencyBadge';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Find a Doctor', path: '/patient/doctors', icon: <Search className="w-4 h-4" /> },
  { label: 'My Appointments', path: '/patient/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: appt, refetch } = useQuery({ queryKey: ['appointment', id], queryFn: () => getAppointmentById(id), enabled: !!id });
  const [cancelling, setCancelling] = useState(false);

  if (!appt) return (
    <AppLayout navItems={navItems} title="Appointment" roleColor="bg-accent">
      <div className="text-center py-20 text-muted-foreground">Appointment not found.</div>
    </AppLayout>
  );

  const handleCancel = () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    const updated = { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() };
    saveAppointment(updated);
    sendCancellationNotice(updated, 'Cancelled by patient');
    refetch();
    setCancelling(false);
    toast.success('Appointment cancelled.');
  };

  const canCancel = appt.status === 'confirmed' || appt.status === 'pending';

  return (
    <AppLayout navItems={navItems} title="Appointment Details" roleColor="bg-accent">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">{appt.doctorName}</h2>
              <p className="text-muted-foreground">{appt.specialisation}</p>
            </div>
            <StatusBadge status={appt.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mt-4">
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-medium">{formatDate(appt.date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Time</p>
              <p className="font-medium">{formatTime(appt.time)}</p>
            </div>
          </div>
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              className="mt-4"
              onClick={handleCancel}
              disabled={cancelling}
            >
              <X className="w-4 h-4 mr-1" /> Cancel Appointment
            </Button>
          )}
        </div>

        {appt.preVisitSummary && (
          <div className="bg-card rounded-xl border border-border p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Pre-Visit Summary</h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} />
            </div>
            <p className="text-sm text-foreground mb-3 leading-relaxed">{appt.preVisitSummary.summaryText}</p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED QUESTIONS FOR DOCTOR</p>
              <ul className="space-y-1.5">
                {appt.preVisitSummary.suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {appt.postVisitSummary && (
          <div className="bg-card rounded-xl border border-green-200 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Post-Visit Summary</h3>
            </div>
            <p className="text-sm text-foreground mb-4 leading-relaxed">{appt.postVisitSummary.summaryText}</p>

            {appt.postVisitSummary.medicationSchedule.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-semibold">Medication Schedule</p>
                </div>
                <div className="space-y-2">
                  {appt.postVisitSummary.medicationSchedule.map((med, i) => (
                    <div key={i} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-800">{med.medication} — {med.dosage}</p>
                      <p className="text-xs text-purple-600 mt-0.5">{med.schedule}</p>
                      {med.instructions && <p className="text-xs text-muted-foreground mt-1">{med.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appt.postVisitSummary.followUpSteps.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Follow-Up Steps</p>
                <ul className="space-y-1.5">
                  {appt.postVisitSummary.followUpSteps.map((step, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {appt.prescription && appt.prescription.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-foreground">Prescription</h3>
            </div>
            <div className="space-y-2">
              {appt.prescription.map((p, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <p className="font-medium text-sm">{p.medication} <span className="text-muted-foreground font-normal">({p.dosage})</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.frequency} · {p.duration}</p>
                  {p.instructions && <p className="text-xs text-foreground mt-1">{p.instructions}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {appt.calendarEventId && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Calendar Event Created</p>
              <p className="text-xs text-blue-600">Event ID: {appt.calendarEventId}</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
