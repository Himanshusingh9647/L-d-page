import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, BookOpen, Users, ClipboardList, RotateCw, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const adminRoutes = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Modules', path: '/admin/modules', icon: BookOpen },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Assign Training', path: '/admin/assignments', icon: ClipboardList },
    { name: 'Recurring Training', path: '/admin/recurring', icon: RotateCw },
  ];

  const employeeRoutes = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Certificates', path: '/certificates', icon: GraduationCap },
  ];

  const availableRoutes = isAdmin ? adminRoutes : employeeRoutes;

  const filteredRoutes = availableRoutes.filter(route => 
    route.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100); // Wait for CSS transition
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleModalKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredRoutes.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === 'Enter' && filteredRoutes[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredRoutes[selectedIndex].path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div 
        className="relative w-full max-w-lg bg-surface rounded-xl shadow-2xl overflow-hidden border border-border flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search size={20} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            className="w-full bg-transparent p-4 text-text placeholder-text-secondary outline-none focus:ring-0 text-lg"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleModalKeyDown}
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route, index) => (
              <button
                key={route.path}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-150 outline-none",
                  index === selectedIndex ? "bg-primary-light text-primary" : "text-text hover:bg-slate-50"
                )}
                onClick={() => handleSelect(route.path)}
                onMouseMove={() => setSelectedIndex(index)}
              >
                <route.icon size={18} className={index === selectedIndex ? "text-primary" : "text-text-secondary"} />
                <span className="font-medium">{route.name}</span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-text-secondary text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] font-medium text-text-secondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↑</kbd><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↵</kbd> to select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
