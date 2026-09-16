import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CommandPalette } from '../ui/CommandPalette';

export default function MainLayout({ requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();
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
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-text-secondary font-medium">Loading L&D Portal...</span>
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
    <div className="flex h-screen bg-background overflow-hidden text-text">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNavigation />
        
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

