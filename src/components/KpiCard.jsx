export default function KpiCard({ icon: Icon, label, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: {
      icon: 'text-blue-700 bg-blue-50',
      value: 'text-slate-900',
    },
    green: {
      icon: 'text-green-700 bg-green-50',
      value: 'text-slate-900',
    },
    amber: {
      icon: 'text-amber-700 bg-amber-50',
      value: 'text-slate-900',
    },
    slate: {
      icon: 'text-slate-700 bg-slate-100',
      value: 'text-slate-900',
    },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`text-3xl font-semibold mt-2 ${c.value}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`flex-shrink-0 p-2.5 rounded-md ${c.icon}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
