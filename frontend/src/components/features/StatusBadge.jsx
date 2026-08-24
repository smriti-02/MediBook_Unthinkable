const config = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200' },
  'no-show': { label: 'No Show', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default function StatusBadge({ status }) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}
