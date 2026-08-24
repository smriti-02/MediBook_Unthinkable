import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import {  getAppointmentsByDoctor, getDoctors  } from '@/lib/api';
import { Calendar, ClipboardList, LayoutDashboard, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/features/StatusBadge';
import UrgencyBadge from '@/components/features/UrgencyBadge';
import { formatDate, formatTime } from '@/lib/slots';

const navItems = [
  { label: 'Dashboard', path: '/doctor', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Schedule', path: '/doctor/schedule', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const doctor = doctors.find(d => d.userId === user?.id);
  const { data: rawAppts = [] } = useQuery({ queryKey: ['doctor-appointments', doctor?.id], queryFn: () => getAppointmentsByDoctor(doctor.id), enabled: !!doctor?.id });
  const all = [...rawAppts].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const today = new Date().toISOString().split('T')[0];

  const filtered = all.filter(a => {
    if (filter === 'today') return a.date === today;
    if (filter === 'upcoming') return a.date > today && a.status !== 'cancelled';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const filters = ['all', 'today', 'upcoming', 'completed'];

  return (
    <AppLayout navItems={navItems} title="Appointments" roleColor="bg-primary">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Appointments</h2>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize transition-colors ${
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
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <div
              key={appt.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 cursor-pointer transition-all"
              onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-primary text-xs">{new Date(appt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{appt.patientName}</p>
                    <StatusBadge status={appt.status} />
                    {appt.preVisitSummary && <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{appt.symptoms}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(appt.date)} · {formatTime(appt.time)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
