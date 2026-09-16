import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none duration-150 ease-out';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 shadow-sm focus:ring-primary',
    secondary: 'bg-white text-text border border-border hover:bg-slate-50 focus:ring-slate-200',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light focus:ring-primary',
    ghost: 'text-text-secondary hover:text-text hover:bg-slate-100 focus:ring-slate-200',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-sm focus:ring-danger',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
