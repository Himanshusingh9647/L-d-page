import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, RotateCw, FileText,
  BookOpen, GraduationCap, ChevronLeft, ChevronRight, LogOut, CheckSquare
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
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
      className={`sidebar flex flex-col h-full ${collapsed ? 'w-20' : 'w-64'} bg-black text-slate-300 transition-all duration-300 z-50 shadow-2xl border-r border-slate-800/50`}
      onMouseEnter={() => collapsed && setCollapsed(false)}
      onMouseLeave={() => window.innerWidth >= 1024 ? null : setCollapsed(true)}
    >
      {/* Logo section */}
      <div className="p-6 border-b border-slate-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in whitespace-nowrap">
              <span className="font-black text-xl text-white tracking-tight">L&D Portal</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 overflow-y-auto overflow-x-hidden space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 whitespace-nowrap">
          {!collapsed && (isAdmin ? 'Administration' : 'Training')}
        </div>
        
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-[#eff2ff] text-[#4f46e5] shadow-sm' 
                  : 'text-[#8b92a5] hover:bg-slate-800/50 hover:text-white'
              }`
            }
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 transition-colors ${isActive ? 'text-[#4f46e5]' : 'text-[#64748b] group-hover:text-[#94a3b8]'}`} />
                {!collapsed && (
                  <span className={`font-semibold tracking-wide text-[15px] whitespace-nowrap ${isActive ? 'text-[#4f46e5]' : ''}`}>
                    {link.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-5 mt-auto border-t border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">
            {user?.initials || 'AK'}
          </div>
          {!collapsed && (
            <div className="animate-fade-in flex flex-col overflow-hidden whitespace-nowrap">
              <span className="font-bold text-sm text-white tracking-tight">{user?.fullName || 'Arjun Kapoor'}</span>
              <span className="text-xs font-medium text-slate-400">{user?.role || 'Admin'}</span>
            </div>
          )}
        </div>
        
        <button
          className="w-full flex items-center justify-start gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-semibold text-[15px] group whitespace-nowrap mt-2"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={22} className="text-slate-500 group-hover:text-rose-500 transition-colors shrink-0" strokeWidth={2} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
