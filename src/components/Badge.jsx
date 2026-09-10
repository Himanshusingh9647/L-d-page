export default function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    required: 'bg-red-50 text-red-700 border border-red-200',
    optional: 'bg-slate-50 text-slate-500 border border-slate-200',
    video: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    pdf: 'bg-amber-50 text-amber-700 border border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-orange-50 text-orange-700 border border-orange-200',
    compliant: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
