import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { getAppointments, saveAppointment } from '@/lib/api';
import { sendCancellationNotice } from '@/lib/notifications';
import { LayoutDashboard, Users, Calendar, Stethoscope, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/features/StatusBadge';
import UrgencyBadge from '@/components/features/UrgencyBadge';
import { formatDate, formatTime } from '@/lib/slots';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Patients', path: '/admin/patients', icon: <Users className="w-4 h-4" /> },
  { label: 'All Appointments', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { data: rawAppointments = [], refetch: refresh } = useQuery({ queryKey: ['appointments'], queryFn: getAppointments });
  const appointments = [...rawAppointments].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));

  const filtered = appointments.filter(a => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const handleCancel = (appt) => {
    if (!window.confirm(`Cancel appointment for ${appt.patientName}?`)) return;
    const updated = { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() };
    saveAppointment(updated);
    sendCancellationNotice(updated, 'Cancelled by admin');
    refresh();
    toast.success('Appointment cancelled. Parties notified.');
  };

  const filters = ['all', 'confirmed', 'completed', 'cancelled'];

  return (
    <AppLayout navItems={navItems} title="All Appointments" roleColor="bg-[hsl(262,60%,50%)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Appointments ({appointments.length})</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patient or doctor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
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
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(appt => (
            <div key={appt.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{new Date(appt.date + 'T00:00:00').getDate()}</span>
                  <span className="text-primary text-xs">{new Date(appt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{appt.patientName}</p>
                    <span className="text-muted-foreground text-xs">→</span>
                    <p className="text-sm text-muted-foreground">{appt.doctorName}</p>
                    <StatusBadge status={appt.status} />
                    {appt.preVisitSummary && <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(appt.date)} · {formatTime(appt.time)} · {appt.specialisation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(appt.status === 'confirmed' || appt.status === 'pending') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(appt)}
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
