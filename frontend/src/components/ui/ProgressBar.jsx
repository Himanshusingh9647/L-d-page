import { cn } from '../../lib/utils';

export function ProgressBar({ value, max = 100, className, indicatorClassName }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full h-2 rounded-full bg-slate-100 overflow-hidden', className)}>
      <div
        className={cn('h-full bg-primary transition-all duration-500 ease-out', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
