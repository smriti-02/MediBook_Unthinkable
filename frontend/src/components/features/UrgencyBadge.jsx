import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function UrgencyBadge({ level, size = 'md' }) {
  const config = {
    Low: { icon: Info, bg: 'bg-green-100 text-green-700 border-green-200', label: 'Low Urgency' },
    Medium: { icon: AlertCircle, bg: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium Urgency' },
    High: { icon: AlertTriangle, bg: 'bg-red-100 text-red-700 border-red-200', label: 'High Urgency' },
  };
  const c = config[level];
  const Icon = c.icon;
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-3 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${c.bg} ${sz}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {c.label}
    </span>
  );
}
