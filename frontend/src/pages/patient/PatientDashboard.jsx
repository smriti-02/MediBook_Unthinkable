import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentsByPatient  } from '@/lib/api';
import {  getUserNotifications  } from '@/lib/api';
import { Calendar, Search, ClipboardList, Bell, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/features/StatusBadge';
import { formatDate, formatTime } from '@/lib/slots';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Find a Doctor', path: '/patient/doctors', icon: <Search className="w-4 h-4" /> },
  { label: 'My Appointments', path: '/patient/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: rawAppts = [] } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: () => getAppointmentsByPatient(user.id),
    enabled: !!user?.id
  });
  const appointments = rawAppts;
  const upcoming = appointments
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = appointments.filter(a => a.status === 'completed').slice(0, 3);
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getUserNotifications(user.id),
    enabled: !!user?.id
  });
  const unread = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: ClipboardList, color: 'text-green-600 bg-green-50' },
    { label: 'Notifications', value: unread, icon: Bell, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <AppLayout navItems={navItems} title="Patient Dashboard" roleColor="bg-accent">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Good day, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-muted-foreground mt-1">Here's your health overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book CTA */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 mb-8 text-white">
        <h3 className="text-xl font-bold mb-2">Need to see a doctor?</h3>
        <p className="text-white/80 text-sm mb-4">Find specialists and book appointments instantly</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/patient/doctors')}
          className="bg-white text-primary hover:bg-white/90"
        >
          <Search className="w-4 h-4 mr-2" /> Find a Doctor
        </Button>
      </div>

      {/* Upcoming appointments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Appointments</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No upcoming appointments</p>
            <p className="text-sm mt-1">Book one to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map(appt => (
              <div
                key={appt.id}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/40 cursor-pointer transition-colors"
                onClick={() => navigate(`/patient/appointments/${appt.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-primary text-xs">{new Date(appt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{appt.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{appt.specialisation}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTime(appt.time)}
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past appointments */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Visits</h3>
          <div className="space-y-2">
            {past.map(appt => (
              <div
                key={appt.id}
                className="bg-card rounded-lg border border-border p-3 flex items-center gap-3 hover:border-primary/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/patient/appointments/${appt.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{appt.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(appt.date)}</p>
                </div>
                {appt.postVisitSummary && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                    Summary available
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
