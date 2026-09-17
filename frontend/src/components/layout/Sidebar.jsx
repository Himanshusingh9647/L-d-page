import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, RotateCw, BookOpen, GraduationCap, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Assign Training' },
  { to: '/admin/recurring', icon: RotateCw, label: 'Recurring Training' },
];

const employeeLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/certificates', icon: GraduationCap, label: 'Certificates' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { isAdmin, logout, user } = useAuth();
  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside
      className={cn(
        "group/sidebar flex flex-col h-full bg-surface border-r border-border shrink-0 transition-[width] duration-300 ease-in-out relative z-50",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 w-[212px]">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <span className={cn(
            "font-bold text-lg text-text whitespace-nowrap transition-opacity duration-200 ease-in-out",
            collapsed ? "opacity-0 invisible" : "opacity-100 visible"
          )}>
            L&D
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out group relative overflow-hidden",
              isActive 
                ? "text-primary font-semibold bg-primary/5" 
                : "text-text-secondary hover:bg-surface-hover hover:text-text font-medium"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r transition-all duration-300 ease-out",
                  isActive ? "h-6 opacity-100 scale-y-100" : "h-6 opacity-0 scale-y-0"
                )} />
                <div className="flex items-center gap-3 w-[212px] pl-1">
                  <link.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={cn(
                      "shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110", 
                      isActive ? "text-primary" : "text-text-secondary group-hover:text-text"
                    )} 
                  />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity duration-200 ease-in-out",
                    collapsed ? "opacity-0 invisible" : "opacity-100 visible"
                  )}>
                    {link.label}
                  </span>
                </div>

                {/* CSS Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-14 px-2 py-1 bg-secondary text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap translate-x-1 group-hover:translate-x-2">
                    {link.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Rich Profile & Settings */}
      <div className="p-4 border-t border-border mt-auto shrink-0 bg-background/50">
        <div className={cn("overflow-hidden transition-all duration-300", collapsed ? "h-0 opacity-0" : "h-auto opacity-100 mb-4")}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.initials || '??'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text leading-tight">{user?.fullName || 'User'}</p>
              <p className="text-xs text-text-secondary">{user?.department || 'Department'}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Goal Progress</span>
              <span className="text-xs font-bold text-text">68%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[68%]" />
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors group relative"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-secondary text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                Expand Sidebar
              </div>
            )}
          </button>
          
          <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "gap-1")}>
            <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors group relative">
              <LayoutDashboard size={18} />
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-secondary text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                  Settings
                </div>
              )}
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors group relative"
            >
              <LogOut size={18} />
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-secondary text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
