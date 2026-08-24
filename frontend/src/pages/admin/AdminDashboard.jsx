import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { getDoctors, getAppointments, getUsers } from '@/lib/api';
import { LayoutDashboard, Users, Calendar, TrendingUp, ChevronRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/slots';
import StatusBadge from '@/components/features/StatusBadge';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Patients', path: '/admin/patients', icon: <Users className="w-4 h-4" /> },
  { label: 'All Appointments', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: getAppointments });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const patients = users.filter(u => u.role === 'patient');
  const today = new Date().toISOString().split('T')[0];

  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const recentAppts = appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Active Doctors', value: doctors.filter(d => d.isActive).length, icon: Stethoscope, color: 'text-primary bg-secondary', path: '/admin/doctors' },
    { label: 'Patients', value: patients.length, icon: Users, color: 'text-accent bg-accent/10', path: '/admin/patients' },
    { label: "Today's Appts", value: todayAppts.length, icon: Calendar, color: 'text-blue-600 bg-blue-50', path: '/admin/appointments' },
    { label: 'Total Bookings', value: appointments.length, icon: TrendingUp, color: 'text-purple-600 bg-purple-50', path: '/admin/appointments' },
  ];

  return (
    <AppLayout navItems={navItems} title="Admin Dashboard" roleColor="bg-[hsl(262,60%,50%)]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Clinic Overview</h2>
        <p className="text-muted-foreground mt-1">{formatDate(today)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/40 cursor-pointer transition-colors"
              onClick={() => navigate(s.path)}
            >
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Doctors</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/doctors')}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {doctors.slice(0, 4).map(doc => (
            <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">{doc.name.split(' ')[1]?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.specialisation}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${doc.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {doc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Bookings</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/appointments')}>
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {recentAppts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No appointments yet</p>
          ) : recentAppts.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.patientName}</p>
                <p className="text-xs text-muted-foreground">{a.doctorName} · {a.date}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
