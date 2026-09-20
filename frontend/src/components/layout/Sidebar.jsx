import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, RotateCw, FileText,
  BookOpen, ShieldCheck, LogOut
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/admin/employees', icon: Users, label: 'Employees & Audits' },
  { to: '/admin/assignments', icon: ClipboardList, label: 'Assign Training' },
  { to: '/admin/recurring', icon: RotateCw, label: 'Recurring Training' },
];

const employeeLinks = [
  { to: '/', icon: BookOpen, label: 'My Training', end: true },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside
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
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3.5 overflow-y-auto overflow-x-hidden space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 whitespace-nowrap">
          {!collapsed && (isAdmin ? 'Administration' : 'Curriculum')}
        </div>
        
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
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
                    {link.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

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
            </div>
          )}
        </div>
        
        <button
          className="w-full flex items-center justify-start gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-semibold text-xs group whitespace-nowrap cursor-pointer"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors shrink-0" strokeWidth={2} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
