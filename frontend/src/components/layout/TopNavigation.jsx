import { Bell, Search } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export default function TopNavigation() {
  return (
    <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-8 shrink-0 z-40 sticky top-0 transition-colors duration-200">
      <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
        <span className="hover:text-text cursor-pointer transition-colors duration-150">Home</span>
        <span>/</span>
        <span className="text-text">Dashboard</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-64 group/search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary group-focus-within/search:text-primary transition-colors duration-200" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-border rounded-lg leading-5 bg-background text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all duration-200 ease-in-out focus:w-72 focus:shadow-sm peer"
            placeholder="Search anything..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none peer-focus:opacity-0 transition-opacity duration-200">
            <span className="text-[10px] font-semibold text-text-secondary bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-text transition-colors duration-150 relative p-1 rounded-full hover:bg-slate-50">
            <Bell size={20} />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface animate-pulse" />
          </button>
          
          <div className="w-px h-6 bg-border" />
          
          <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-all duration-150 group/avatar">
            <Avatar initials="AK" size="sm" className="group-hover/avatar:ring-2 ring-primary/20 transition-all" />
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-sm font-semibold text-text leading-tight group-hover/avatar:text-primary transition-colors">Arjun Kapoor</span>
              <span className="text-[11px] text-text-secondary font-medium">Employee</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

