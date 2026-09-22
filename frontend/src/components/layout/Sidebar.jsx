import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
<<<<<<< HEAD
  LayoutDashboard, Users, ClipboardList, RotateCw, BookOpen, GraduationCap, LogOut, ChevronLeft, ChevronRight
=======
  LayoutDashboard, Users, ClipboardList, RotateCw, FileText,
  BookOpen, ShieldCheck, LogOut
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
} from 'lucide-react';
import { cn } from '../../lib/utils';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/admin/employees', icon: Users, label: 'Employees & Audits' },
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
<<<<<<< HEAD
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
=======
      className={`sidebar flex flex-col h-full ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 transition-all duration-300 z-50 shadow-xl border-r border-slate-200/80 dark:border-slate-800/60`}
      onMouseEnter={() => collapsed && setCollapsed(false)}
      onMouseLeave={() => (window.innerWidth >= 1024 ? null : setCollapsed(true))}
    >
      {/* Logo section */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in whitespace-nowrap">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">SEMCO L&D</span>
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-widest mt-1">
                {isAdmin ? 'HR & IT Admin' : 'Training Portal'}
              </span>
            </div>
          )}
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
        </div>
      </div>

      {/* Navigation */}
<<<<<<< HEAD
      <nav className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden space-y-1">
=======
      <nav className="flex-1 py-6 px-3.5 overflow-y-auto overflow-x-hidden space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 whitespace-nowrap">
          {!collapsed && (isAdmin ? 'Administration' : 'Curriculum')}
        </div>
        
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
<<<<<<< HEAD
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
=======
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-blue-600 dark:hover:text-white'
              }`
            }
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <link.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} 
                />
                {!collapsed && (
                  <span className="font-medium tracking-wide text-sm whitespace-nowrap">
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
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

<<<<<<< HEAD
      {/* Rich Profile & Settings */}
      <div className="p-4 border-t border-border mt-auto shrink-0 bg-background/50">
        <div className={cn("overflow-hidden transition-all duration-300", collapsed ? "h-0 opacity-0" : "h-auto opacity-100 mb-4")}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.initials || '??'}
=======
      {/* User Section */}
      <div className="p-4 mt-auto border-t border-slate-200/80 dark:border-slate-800/60 shrink-0 space-y-2">
        {/* User profile */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
            {user?.initials || 'SS'}
          </div>
          {!collapsed && (
            <div className="animate-fade-in flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-bold text-xs text-slate-800 dark:text-white tracking-tight truncate">{user?.fullName || 'SEMCO HR'}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{user?.role || 'Admin'}</span>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
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
<<<<<<< HEAD
=======
        
        <button
          className="w-full flex items-center justify-start gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-semibold text-xs group whitespace-nowrap cursor-pointer"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors shrink-0" strokeWidth={2} />
          {!collapsed && <span>Sign Out</span>}
        </button>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
      </div>
    </aside>
  );
}
