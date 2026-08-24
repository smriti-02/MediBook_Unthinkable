import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/lib/api';
import { Calendar, Search, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Find a Doctor', path: '/patient/doctors', icon: <Search className="w-4 h-4" /> },
  { label: 'My Appointments', path: '/patient/appointments', icon: <ClipboardList className="w-4 h-4" /> },
];

const SPECIALISATIONS = [
  'All', 'Cardiology', 'General Practice', 'Dermatology', 'Neurology',
  'Orthopaedics', 'Paediatrics', 'Psychiatry', 'Ophthalmology',
];

export default function FindDoctorPage() {
  const navigate = useNavigate();
  const { data: rawDoctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const doctors = rawDoctors.filter(d => d.isActive);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialisation.toLowerCase().includes(search.toLowerCase());
    const matchSpec = spec === 'All' || d.specialisation === spec;
    return matchSearch && matchSpec;
  });

  return (
    <AppLayout navItems={navItems} title="Find a Doctor" roleColor="bg-accent">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Find a Doctor</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialisation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SPECIALISATIONS.map(s => (
            <button
              key={s}
              onClick={() => setSpec(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                spec === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No doctors found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(doc => {
            const enabledDays = Object.entries(doc.workingHours)
              .filter(([, v]) => v.enabled)
              .map(([k]) => k.slice(0, 3))
              .join(', ');
            return (
              <div
                key={doc.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => navigate(`/patient/book/${doc.id}`)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-xl">{doc.name.split(' ')[1]?.charAt(0) || doc.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{doc.name}</h3>
                    <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full mt-1">
                      {doc.specialisation}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{doc.qualifications}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{doc.bio}</p>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Slot: {doc.slotDuration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{enabledDays}</span>
                  </div>
                </div>
                <Button size="sm" className="w-full group-hover:bg-primary/90">
                  Book Appointment <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
