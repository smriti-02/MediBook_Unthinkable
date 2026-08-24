import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentById, saveAppointment  } from '@/lib/api';
import { generatePostVisitSummary } from '@/lib/ai';
import { sendPostVisitSummaryNotice, scheduleMedicationReminders } from '@/lib/notifications';
import { formatDate, formatTime } from '@/lib/slots';
import { Calendar, ClipboardList, LayoutDashboard, ChevronLeft, Brain, User, Pill, Plus, X, Loader, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/features/StatusBadge';
import UrgencyBadge from '@/components/features/UrgencyBadge';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Schedule', path: '/doctor/schedule', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

const emptyRx = { medication: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function DoctorAppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: appt, refetch } = useQuery({ queryKey: ['appointment', id], queryFn: () => getAppointmentById(id), enabled: !!id });
  const [notes, setNotes] = useState(appt?.postVisitNotes || '');
  const [prescriptions, setPrescriptions] = useState(appt?.prescription || []);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!appt) return (
    <AppLayout navItems={navItems} title="Appointment" roleColor="bg-primary">
      <div className="text-center py-20 text-muted-foreground">Appointment not found.</div>
    </AppLayout>
  );

  const addRx = () => setPrescriptions(p => [...p, { ...emptyRx }]);
  const removeRx = (i) => setPrescriptions(p => p.filter((_, idx) => idx !== i));
  const updateRx = (i, k, v) => {
    setPrescriptions(p => p.map((rx, idx) => idx === i ? { ...rx, [k]: v } : rx));
  };

  const handleComplete = async () => {
    if (!notes.trim()) { toast.error('Please add visit notes before completing.'); return; }
    setGenerating(true);
    toast.info('Generating patient-friendly summary with AI...');

    const postVisitSummary = await generatePostVisitSummary(notes, prescriptions.filter(p => p.medication));
    setGenerating(false);
    setSaving(true);

    const updated = {
      ...appt,
      status: 'completed',
      postVisitNotes: notes,
      prescription: prescriptions.filter(p => p.medication),
      postVisitSummary,
      updatedAt: new Date().toISOString(),
    };
    saveAppointment(updated);
    sendPostVisitSummaryNotice(updated);
    scheduleMedicationReminders(updated);
    refetch();
    setSaving(false);
    toast.success('Visit completed. Patient summary sent.');
  };

  const handleMarkNoShow = () => {
    const updated = { ...appt, status: 'no-show', updatedAt: new Date().toISOString() };
    saveAppointment(updated);
    refetch();
    toast.info('Marked as no-show.');
  };

  const isEditable = appt.status === 'confirmed' || appt.status === 'pending';

  return (
    <AppLayout navItems={navItems} title="Appointment Detail" roleColor="bg-primary">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{appt.patientName}</h2>
                <p className="text-sm text-muted-foreground">{appt.patientEmail} · {appt.patientPhone}</p>
              </div>
            </div>
            <StatusBadge status={appt.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3 mt-3">
            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(appt.date)}</p></div>
            <div><p className="text-xs text-muted-foreground">Time</p><p className="font-medium">{formatTime(appt.time)}</p></div>
          </div>
        </div>

        {appt.preVisitSummary && (
          <div className="bg-card rounded-xl border border-border p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Pre-Visit Summary</h3>
              <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />
            </div>
            <p className="text-sm mb-3 leading-relaxed">{appt.preVisitSummary.summaryText}</p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED QUESTIONS</p>
              <ul className="space-y-1">
                {appt.preVisitSummary.suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary font-bold">{i + 1}.</span> {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">PATIENT-REPORTED SYMPTOMS</p>
              <div className="flex flex-wrap gap-1.5">
                {(appt.symptomsDetail?.symptoms || []).map(s => (
                  <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
              {appt.symptomsDetail?.currentMedications && (
                <p className="text-xs text-muted-foreground mt-2"><strong>Current meds:</strong> {appt.symptomsDetail.currentMedications}</p>
              )}
              {appt.symptomsDetail?.allergies && (
                <p className="text-xs text-destructive mt-1"><strong>Allergies:</strong> {appt.symptomsDetail.allergies}</p>
              )}
            </div>
          </div>
        )}

        {isEditable && (
          <div className="bg-card rounded-xl border border-border p-5 mb-4">
            <h3 className="font-semibold mb-4">Post-Visit Notes & Prescription</h3>

            <div className="space-y-1.5 mb-5">
              <Label>Clinical Notes *</Label>
              <Textarea
                placeholder="Enter clinical observations, diagnosis, and treatment plan..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-purple-600" />
                  <Label className="mb-0">Prescription</Label>
                </div>
                <Button variant="outline" size="sm" onClick={addRx}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Medication
                </Button>
              </div>
              <div className="space-y-3">
                {prescriptions.map((rx, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 relative">
                    <button onClick={() => removeRx(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Input placeholder="Medication name" value={rx.medication} onChange={e => updateRx(i, 'medication', e.target.value)} className="text-sm" />
                      </div>
                      <Input placeholder="Dosage (e.g., 500mg)" value={rx.dosage} onChange={e => updateRx(i, 'dosage', e.target.value)} className="text-sm" />
                      <Input placeholder="Frequency (e.g., twice daily)" value={rx.frequency} onChange={e => updateRx(i, 'frequency', e.target.value)} className="text-sm" />
                      <Input placeholder="Duration (e.g., 7 days)" value={rx.duration} onChange={e => updateRx(i, 'duration', e.target.value)} className="text-sm" />
                      <Input placeholder="Special instructions" value={rx.instructions} onChange={e => updateRx(i, 'instructions', e.target.value)} className="text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleMarkNoShow}>Mark No-Show</Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={generating || saving}
              >
                {generating ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Generating Summary...</> :
                  saving ? 'Saving...' :
                  <><CheckCircle className="w-4 h-4 mr-2" /> Complete Visit & Generate Summary</>
                }
              </Button>
            </div>
          </div>
        )}

        {appt.postVisitSummary && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Patient Summary Sent</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">{appt.postVisitSummary.summaryText}</p>
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">FOLLOW-UP STEPS</p>
              <ul className="space-y-1">
                {appt.postVisitSummary.followUpSteps.map((s, i) => (
                  <li key={i} className="text-xs text-green-700">• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
