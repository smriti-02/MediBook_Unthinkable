import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { getDoctors, saveDoctor, deleteDoctor, saveUser } from '@/lib/api';
import { LayoutDashboard, Users, Calendar, Stethoscope, Plus, X, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Doctors', path: '/admin/doctors', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Patients', path: '/admin/patients', icon: <Users className="w-4 h-4" /> },
  { label: 'All Appointments', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultWorking = Object.fromEntries(
  DAYS.map(d => [d, { start: '09:00', end: '17:00', enabled: ['Monday','Tuesday','Wednesday','Thursday','Friday'].includes(d) }])
);

const emptyDoctor = () => ({
  name: '',
  email: '',
  phone: '',
  specialisation: '',
  qualifications: '',
  workingHours: defaultWorking,
  slotDuration: 30,
  leaveDays: [],
  bio: '',
  isActive: true,
});

export default function AdminDoctorsPage() {
  const { data: doctors = [], refetch: refreshDoctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyDoctor());

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.email || !form.specialisation) {
      toast.error('Name, email, and specialisation are required.');
      return;
    }

    if (editId) {
      const existing = doctors.find(d => d.id === editId);
      const updated = { ...existing, ...form };
      saveDoctor(updated);
      toast.success('Doctor updated.');
    } else {
      const id = `doctor-${Date.now()}`;
      const userId = `doctor-user-${Date.now()}`;
      const newDoc = { id, userId, ...form };
      const userRecord = {
        id: userId,
        name: form.name,
        email: form.email,
        role: 'doctor',
        phone: form.phone,
        createdAt: new Date().toISOString(),
      };
      saveDoctor(newDoc);
      saveUser(userRecord);
      const passwords = JSON.parse(localStorage.getItem('medibook_passwords') || '{}');
      passwords[form.email.toLowerCase()] = 'medibook123';
      localStorage.setItem('medibook_passwords', JSON.stringify(passwords));
      toast.success(`Doctor created. Login: ${form.email} / medibook123`);
    }
    refreshDoctors();
    setShowForm(false);
    setEditId(null);
    setForm(emptyDoctor());
  };

  const handleEdit = (doc) => {
    setForm({ ...doc });
    setEditId(doc.id);
    setShowForm(true);
  };

  const handleToggle = (doc) => {
    const updated = { ...doc, isActive: !doc.isActive };
    saveDoctor(updated);
    refreshDoctors();
    toast.success(updated.isActive ? 'Doctor activated.' : 'Doctor deactivated.');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;
    deleteDoctor(id);
    refreshDoctors();
    toast.success('Doctor removed.');
  };

  return (
    <AppLayout navItems={navItems} title="Manage Doctors" roleColor="bg-[hsl(262,60%,50%)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyDoctor()); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Doctor
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">{doc.name.split(' ')[1]?.charAt(0) || doc.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.specialisation}</p>
                <p className="text-xs text-muted-foreground truncate">{doc.qualifications}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                doc.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {doc.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              <p>{doc.email}</p>
              <p>{doc.phone}</p>
              <p className="mt-1">Slot: {doc.slotDuration} min · {doc.leaveDays.length} leave days</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(doc)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant={doc.isActive ? 'secondary' : 'default'}
                className="flex-1"
                onClick={() => handleToggle(doc)}
              >
                {doc.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-destructive hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="Dr. Jane Smith" value={form.name} onChange={e => setF('name', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="doctor@clinic.com" value={form.email} onChange={e => setF('email', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input placeholder="+1-555-0000" value={form.phone} onChange={e => setF('phone', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Specialisation *</Label>
                  <Input placeholder="e.g. Cardiology" value={form.specialisation} onChange={e => setF('specialisation', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Slot Duration (min)</Label>
                  <Input type="number" min={10} max={60} step={5} value={form.slotDuration} onChange={e => setF('slotDuration', Number(e.target.value))} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Qualifications</Label>
                  <Input placeholder="MBBS, MD, etc." value={form.qualifications} onChange={e => setF('qualifications', e.target.value)} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Brief professional bio..." value={form.bio} onChange={e => setF('bio', e.target.value)} rows={2} />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Working Hours</Label>
                <div className="space-y-2 bg-muted/40 rounded-lg p-3">
                  {DAYS.map(day => {
                    const h = form.workingHours[day] || { start: '09:00', end: '17:00', enabled: false };
                    return (
                      <div key={day} className="flex items-center gap-2 text-sm">
                        <label className="flex items-center gap-1.5 w-28">
                          <input
                            type="checkbox"
                            checked={h.enabled}
                            onChange={e => setF('workingHours', { ...form.workingHours, [day]: { ...h, enabled: e.target.checked } })}
                            className="accent-primary"
                          />
                          <span className={h.enabled ? 'text-foreground' : 'text-muted-foreground'}>{day.slice(0, 3)}</span>
                        </label>
                        {h.enabled && (
                          <>
                            <Input type="time" value={h.start} onChange={e => setF('workingHours', { ...form.workingHours, [day]: { ...h, start: e.target.value } })} className="text-xs w-28 h-8" />
                            <span className="text-muted-foreground">–</span>
                            <Input type="time" value={h.end} onChange={e => setF('workingHours', { ...form.workingHours, [day]: { ...h, end: e.target.value } })} className="text-xs w-28 h-8" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleSave} className="flex-1">
                  <Check className="w-4 h-4 mr-2" /> {editId ? 'Save Changes' : 'Create Doctor'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
