import { cn } from '../../lib/utils';

export function Card({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden',
    featured: 'bg-surface border border-slate-200/40 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden',
    compact: 'bg-surface border border-slate-200/50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden'
  };

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-5 border-b border-border/50', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-text', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}
