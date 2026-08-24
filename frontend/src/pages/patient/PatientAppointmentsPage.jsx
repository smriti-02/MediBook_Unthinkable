import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentsByPatient  } from '@/lib/api';
import { Calendar, Search, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/features/StatusBadge';
import { formatDate, formatTime } from '@/lib/slots';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Find a Doctor', path: '/patient/doctors', icon: <Search className="w-4 h-4" /> },
  { label: 'My Appointments', path: '/patient/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: rawAppts = [] } = useQuery({ queryKey: ['appointments', user?.id], queryFn: () => getAppointmentsByPatient(user.id), enabled: !!user?.id });
  const all = [...rawAppts].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const today = new Date().toISOString().split('T')[0];

  const filtered = all.filter(a => {
    if (filter === 'upcoming') return (a.status === 'confirmed' || a.status === 'pending') && a.date >= today;
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  const filters = ['all', 'upcoming', 'completed', 'cancelled'];

  return (
    <AppLayout navItems={navItems} title="My Appointments" roleColor="bg-accent">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <Button size="sm" onClick={() => navigate('/patient/doctors')}>
          + Book New
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No appointments found</p>
          <p className="text-sm mt-1">
            {filter === 'all' ? 'Book your first appointment to get started' : `No ${filter} appointments`}
          </p>
          {filter === 'all' && (
            <Button className="mt-4" size="sm" onClick={() => navigate('/patient/doctors')}>Find a Doctor</Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <div
              key={appt.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 cursor-pointer transition-all hover:shadow-sm"
              onClick={() => navigate(`/patient/appointments/${appt.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-primary text-xs">{new Date(appt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{appt.doctorName}</p>
                    <StatusBadge status={appt.status} />
                    {appt.postVisitSummary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Summary ready</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{appt.specialisation}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(appt.date)} · {formatTime(appt.time)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
