import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentsByDoctor, getDoctors  } from '@/lib/api';
import { Calendar, ClipboardList, Brain, LayoutDashboard, Clock, Users } from 'lucide-react';
import StatusBadge from '@/components/features/StatusBadge';
import UrgencyBadge from '@/components/features/UrgencyBadge';
import { formatDate, formatTime } from '@/lib/slots';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Schedule', path: '/doctor/schedule', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const doctor = doctors.find(d => d.userId === user?.id);
  const doctorId = doctor?.id || '';

  const { data: all = [] } = useQuery({ queryKey: ['doctor-appointments', doctorId], queryFn: () => getAppointmentsByDoctor(doctorId), enabled: !!doctorId });
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = all
    .filter(a => a.date === today && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = all
    .filter(a => a.date > today && a.status !== 'cancelled')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);
  const highUrgency = all.filter(a =>
    a.preVisitSummary?.urgencyLevel === 'High' && a.status === 'confirmed'
  );

  const stats = [
    { label: "Today's Patients", value: todayAppts.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-primary bg-secondary' },
    { label: 'High Urgency', value: highUrgency.length, icon: Brain, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <AppLayout navItems={navItems} title="Doctor Dashboard" roleColor="bg-primary">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
        <p className="text-muted-foreground mt-1">{doctor?.specialisation} · {formatDate(today)}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Today's Patients</h3>
        {todayAppts.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No patients scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppts.map(appt => (
              <div
                key={appt.id}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/40 cursor-pointer transition-colors"
                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
              >
                <div className="flex flex-col items-center justify-center w-14 text-center">
                  <Clock className="w-4 h-4 text-muted-foreground mb-0.5" />
                  <span className="text-sm font-bold text-foreground">{formatTime(appt.time)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{appt.patientName}</p>
                  <p className="text-sm text-muted-foreground truncate">{appt.symptoms}</p>
                </div>
                <div className="flex items-center gap-2">
                  {appt.preVisitSummary && <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />}
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {highUrgency.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-700">⚠ High Urgency Patients</h3>
          <div className="space-y-2">
            {highUrgency.map(appt => (
              <div
                key={appt.id}
                className="bg-red-50 border border-red-200 rounded-xl p-4 cursor-pointer hover:border-red-400 transition-colors"
                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-red-900">{appt.patientName}</p>
                    <p className="text-sm text-red-700">{formatDate(appt.date)} at {formatTime(appt.time)}</p>
                    <p className="text-xs text-red-600 mt-0.5">{appt.preVisitSummary?.chiefComplaint}</p>
                  </div>
                  <UrgencyBadge level="High" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View all</Button>
          </div>
          <div className="space-y-2">
            {upcoming.map(appt => (
              <div
                key={appt.id}
                className="bg-card rounded-lg border border-border p-3 flex items-center gap-3 hover:border-primary/30 cursor-pointer"
                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-primary text-xs">{new Date(appt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{appt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(appt.time)} · {appt.symptoms?.slice(0, 50)}</p>
                </div>
                {appt.preVisitSummary && <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
