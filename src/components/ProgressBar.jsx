export default function ProgressBar({ value, max, size = 'md', showLabel = true, className = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-slate-600">
            Progress
          </span>
          <span className="text-sm font-medium text-slate-900">{pct}% ({value}/{max})</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${pct}%`,
            backgroundColor: pct === 100 ? '#16a34a' : '#2563eb', // green-600 or blue-600
          }}
        />
      </div>
    </div>
  );
}
