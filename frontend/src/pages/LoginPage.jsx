import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Stethoscope, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import heroImg from '@/assets/hero.jpg';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await login(email.trim(), password);
    setLoading(false);
    if (!success) { toast.error(error); return; }

    const user = JSON.parse(localStorage.getItem('medibook_current_user') || '{}');
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'doctor') navigate('/doctor');
    else navigate('/patient');
  };

  const quickLogin = (e) => { setEmail(e); setPassword('medibook123'); };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>MediBook</span>
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
        <p className="text-muted-foreground mb-8">Sign in to your healthcare portal</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New patient?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-8 p-4 rounded-xl bg-muted/60 border border-border">
          <p className="text-xs font-semibold text-foreground mb-3">Demo Accounts (password: medibook123)</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Admin', email: 'admin@medibook.com' },
              { label: 'Patient', email: 'alex@example.com' },
              { label: 'Dr. Chen', email: 'sarah.chen@medibook.com' },
              { label: 'Dr. Okafor', email: 'james.okafor@medibook.com' },
            ].map(d => (
              <button
                key={d.email}
                type="button"
                onClick={() => quickLogin(d.email)}
                className="text-xs px-2 py-1.5 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-colors text-left truncate"
              >
                <span className="font-medium">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={heroImg} alt="Healthcare" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Smart Healthcare,<br />Simplified
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            AI-powered appointment management for patients, doctors, and clinic administrators. Book slots, get symptom summaries, and stay informed.
          </p>
          <div className="flex gap-6 mt-8">
            {[{ n: '3', l: 'Portals' }, { n: 'AI', l: 'Summaries' }, { n: '100%', l: 'Secure' }].map(s => (
              <div key={s.l}>
                <p className="text-2xl font-bold">{s.n}</p>
                <p className="text-white/60 text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
