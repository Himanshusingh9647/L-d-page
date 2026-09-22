import NotificationsDropdown from './NotificationsDropdown';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CommandPalette } from '../ui/CommandPalette';

export default function MainLayout({ requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Monitor screen size to auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading SEMCO L&D Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'Admin' ? '/admin' : '/'} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-40 sticky top-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Samsung Electro-Mechanics</span>
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Enterprise L&D</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Quick Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
            </button>

            <NotificationsDropdown />
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background transition-all duration-300">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}

