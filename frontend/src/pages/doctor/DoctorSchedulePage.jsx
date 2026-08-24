import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {  getDoctors, saveDoctor, getAppointmentsByDoctor, saveAppointment  } from '@/lib/api';
import { sendDoctorLeaveNotice } from '@/lib/notifications';
import { formatDate } from '@/lib/slots';
import { Calendar, ClipboardList, LayoutDashboard, Plus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Schedule', path: '/doctor/schedule', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const [doctor, setDoctorState] = useState(
    doctors.find(d => d.userId === user?.id)
  );
  const [newLeave, setNewLeave] = useState('');
  const [saving, setSaving] = useState(false);

  if (!doctor) return (
    <AppLayout navItems={navItems} title="Schedule" roleColor="bg-primary">
      <div className="text-center py-20 text-muted-foreground">Doctor profile not found. Contact admin.</div>
    </AppLayout>
  );

  const updateWorkingHours = (day, field, value) => {
    setDoctorState(d => d ? {
      ...d,
      workingHours: {
        ...d.workingHours,
        [day]: { ...d.workingHours[day], [field]: value },
      },
    } : d);
  };

  const addLeave = async () => {
    if (!newLeave) return;
    if (doctor.leaveDays.includes(newLeave)) { toast.error('Already marked as leave.'); return; }

    const appts = await getAppointmentsByDoctor(doctor.id);
    const affectedAppts = appts.filter(a => a.date === newLeave && a.status !== 'cancelled');

    const updated = { ...doctor, leaveDays: [...doctor.leaveDays, newLeave].sort() };
    setDoctorState(updated);
    saveDoctor(updated);

    affectedAppts.forEach(appt => {
      const cancelled = { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() };
      saveAppointment(cancelled);
      sendDoctorLeaveNotice(cancelled);
    });

    if (affectedAppts.length > 0) {
      toast.warning(`${affectedAppts.length} appointment(s) cancelled and patients notified.`);
    } else {
      toast.success(`Leave added for ${formatDate(newLeave)}`);
    }
    setNewLeave('');
  };

  const removeLeave = (date) => {
    const updated = { ...doctor, leaveDays: doctor.leaveDays.filter(d => d !== date) };
    setDoctorState(updated);
    saveDoctor(updated);
    toast.success('Leave removed.');
  };

  const saveSchedule = () => {
    setSaving(true);
    if (doctor) saveDoctor(doctor);
    setSaving(false);
    toast.success('Schedule saved.');
  };

  return (
    <AppLayout navItems={navItems} title="My Schedule" roleColor="bg-primary">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">My Schedule</h2>
          <p className="text-muted-foreground text-sm">Manage working hours and leave days</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Working Hours</h3>
          <div className="space-y-3">
            {DAYS.map(day => {
              const h = doctor.workingHours[day] || { start: '09:00', end: '17:00', enabled: false };
              return (
                <div key={day} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-32 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={e => updateWorkingHours(day, 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className={`text-sm font-medium ${h.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{day}</span>
                  </label>
                  {h.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={h.start}
                        onChange={e => updateWorkingHours(day, 'start', e.target.value)}
                        className="text-sm w-28"
                      />
                      <span className="text-muted-foreground text-sm">to</span>
                      <Input
                        type="time"
                        value={h.end}
                        onChange={e => updateWorkingHours(day, 'end', e.target.value)}
                        className="text-sm w-28"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Off</span>
                  )}
                </div>
              );
            })}
          </div>
          <Button className="mt-5" onClick={saveSchedule} disabled={saving}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Leave Days
          </h3>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Adding a leave date will automatically cancel and notify patients with existing appointments on that date.</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              type="date"
              value={newLeave}
              onChange={e => setNewLeave(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Button onClick={addLeave} disabled={!newLeave}>
              <Plus className="w-4 h-4 mr-1" /> Add Leave
            </Button>
          </div>

          {doctor.leaveDays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No leave days scheduled</p>
          ) : (
            <div className="space-y-2">
              {doctor.leaveDays.map(d => (
                <div key={d} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{formatDate(d)}</span>
                  <button onClick={() => removeLeave(d)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
