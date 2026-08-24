import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { getDoctorById, getAppointmentsByDoctor, isSlotTaken, acquireLock, releaseLock, saveAppointment } from '@/lib/api';
import { getAvailableSlots, formatDate, formatTime, getNextDays } from '@/lib/slots';
import { generatePreVisitSummary } from '@/lib/ai';
import { sendBookingConfirmation, simulateCalendarEvent } from '@/lib/notifications';
import { Calendar, Search, ClipboardList, ChevronLeft, Clock, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Find a Doctor', path: '/patient/doctors', icon: <Search className="w-4 h-4" /> },
  { label: 'My Appointments', path: '/patient/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

const SYMPTOMS_LIST = [
  'Fever', 'Headache', 'Chest pain', 'Shortness of breath', 'Fatigue',
  'Nausea', 'Vomiting', 'Dizziness', 'Back pain', 'Joint pain',
  'Rash', 'Cough', 'Sore throat', 'Abdominal pain', 'Loss of appetite',
];

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: doctor } = useQuery({ queryKey: ['doctor', doctorId], queryFn: () => getDoctorById(doctorId), enabled: !!doctorId });
  const { data: bookedAppointments = [] } = useQuery({ queryKey: ['appointments', doctorId], queryFn: () => getAppointmentsByDoctor(doctorId), enabled: !!doctorId });

  const [step, setStep] = useState('slot');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState({
    chiefComplaint: '',
    duration: '',
    severity: 5,
    symptoms: [],
    additionalNotes: '',
    allergies: '',
    currentMedications: '',
  });
  const [loading, setLoading] = useState(false);

  const days = getNextDays(14);

  if (!doctor) {
    return (
      <AppLayout navItems={navItems} title="Book Appointment" roleColor="bg-accent">
        <div className="text-center py-20 text-muted-foreground">Doctor not found.</div>
      </AppLayout>
    );
  }

  const slots = selectedDate ? getAvailableSlots(doctor, selectedDate, bookedAppointments) : [];

  const toggleSymptom = (s) => {
    setSymptoms(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter(x => x !== s)
        : [...prev.symptoms, s],
    }));
  };

  const handleSlotSelect = async (time) => {
    if (!user) return;
    const locked = await acquireLock(doctor.id, selectedDate, time, user.id);
    if (!locked) {
      toast.error('This slot was just taken by another patient. Please choose another.');
      return;
    }
    setSelectedTime(time);
  };

  const handleBook = async () => {
    if (!user || !selectedDate || !selectedTime) return;
    setLoading(true);

    const taken = await isSlotTaken(doctor.id, selectedDate, selectedTime);
    if (taken) {
      toast.error('This slot has just been taken. Please choose another.');
      setLoading(false);
      return;
    }

    try {
      toast.info('Generating AI pre-visit summary...');
      const preVisitSummary = await generatePreVisitSummary(symptoms);

      const apptId = `appt-${Date.now()}`;
      const appt = {
        id: apptId,
        patientId: user.id,
        patientName: user.name,
        patientEmail: user.email,
        patientPhone: user.phone || '',
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        specialisation: doctor.specialisation,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        symptoms: symptoms.chiefComplaint || symptoms.symptoms.join(', '),
        symptomsDetail: symptoms,
        preVisitSummary,
        notificationsSent: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveAppointment(appt);
      await releaseLock(doctor.id, selectedDate, selectedTime);
      await sendBookingConfirmation(appt);
      const calEventId = await simulateCalendarEvent(appt);
      appt.calendarEventId = calEventId;
      await saveAppointment(appt);

      toast.success('Appointment booked! Confirmation sent.');
      navigate(`/patient/appointments/${apptId}`);
    } catch (e) {
      console.error(e);
      toast.error('Booking failed. Please try again.');
      await releaseLock(doctor.id, selectedDate, selectedTime);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['slot', 'symptoms', 'confirm'];

  return (
    <AppLayout navItems={navItems} title="Book Appointment" roleColor="bg-accent">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate('/patient/doctors')} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Doctors
        </Button>

        <div className="bg-card rounded-xl border border-border p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{doctor.name.split(' ')[1]?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.specialisation} · {doctor.slotDuration} min slots</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                step === s ? 'bg-primary text-primary-foreground border-primary' :
                (s === 'slot' && step !== 'slot') || (s === 'symptoms' && step === 'confirm')
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-muted text-muted-foreground border-border'
              }`}>{i + 1}</div>
              <span className={`text-xs font-medium capitalize ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {step === 'slot' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Date</h3>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map(d => {
                  const date = new Date(d + 'T00:00:00');
                  const daySlots = getAvailableSlots(doctor, d);
                  const hasSlots = daySlots.some(s => s.available);
                  const isLeave = doctor.leaveDays.includes(d);
                  return (
                    <button
                      key={d}
                      disabled={!hasSlots || isLeave}
                      onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                      className={`rounded-lg p-2 text-center border transition-all ${
                        selectedDate === d
                          ? 'bg-primary text-primary-foreground border-primary'
                          : hasSlots && !isLeave
                            ? 'bg-card border-border hover:border-primary/50 cursor-pointer'
                            : 'bg-muted/50 border-border opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <p className="text-xs">{date.toLocaleString('default', { weekday: 'short' })}</p>
                      <p className="text-sm font-bold">{date.getDate()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Available Times — {formatDate(selectedDate)}
                </h3>
                {slots.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No available slots for this date.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map(s => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => handleSlotSelect(s.time)}
                        className={`rounded-lg py-2 px-1 text-xs font-medium border transition-colors ${
                          selectedTime === s.time
                            ? 'bg-primary text-primary-foreground border-primary'
                            : s.available
                              ? 'bg-card border-border hover:border-primary/50'
                              : 'bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {formatTime(s.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Slot reserved for 5 minutes</p>
                  <p className="text-xs text-green-600">{formatDate(selectedDate)} at {formatTime(selectedTime)}</p>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep('symptoms')}
            >
              Continue to Symptoms
            </Button>
          </div>
        )}

        {step === 'symptoms' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Describe Your Symptoms</h3>
            <p className="text-sm text-muted-foreground -mt-3">
              This information helps generate an AI pre-visit summary for your doctor.
            </p>

            <div className="space-y-1.5">
              <Label>Chief Complaint *</Label>
              <Input
                placeholder="Main reason for visit (e.g., chest pain for 2 days)"
                value={symptoms.chiefComplaint}
                onChange={e => setSymptoms(s => ({ ...s, chiefComplaint: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input
                placeholder="How long have you had this? (e.g., 3 days, 2 weeks)"
                value={symptoms.duration}
                onChange={e => setSymptoms(s => ({ ...s, duration: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Severity: <span className="text-primary font-bold">{symptoms.severity}/10</span></Label>
              <Slider
                min={1} max={10} step={1}
                value={[symptoms.severity]}
                onValueChange={([v]) => setSymptoms(s => ({ ...s, severity: v }))}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span><span>Moderate</span><span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Symptoms</Label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS_LIST.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      symptoms.symptoms.includes(sym)
                        ? 'bg-primary/10 text-primary border-primary/40'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Current Medications</Label>
              <Input
                placeholder="Any medications you currently take"
                value={symptoms.currentMedications}
                onChange={e => setSymptoms(s => ({ ...s, currentMedications: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Allergies</Label>
              <Input
                placeholder="Known allergies (medications, food, etc.)"
                value={symptoms.allergies}
                onChange={e => setSymptoms(s => ({ ...s, allergies: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any other relevant information for your doctor..."
                value={symptoms.additionalNotes}
                onChange={e => setSymptoms(s => ({ ...s, additionalNotes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('slot')}>Back</Button>
              <Button
                className="flex-1"
                disabled={!symptoms.chiefComplaint}
                onClick={() => setStep('confirm')}
              >
                Review & Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Confirm Appointment</h3>

            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Specialisation</span>
                <span className="font-medium">{doctor.specialisation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chief Complaint</span>
                <span className="font-medium text-right max-w-xs">{symptoms.chiefComplaint}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">AI Pre-Visit Summary</p>
                <p className="text-xs text-blue-600 mt-0.5">An AI-generated symptom summary will be created on booking and sent to your doctor.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('symptoms')}>Back</Button>
              <Button className="flex-1" onClick={handleBook} disabled={loading}>
                {loading ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
