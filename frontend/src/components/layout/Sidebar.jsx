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
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      onMouseEnter={() => collapsed && setCollapsed(false)}
      onMouseLeave={() => window.innerWidth >= 1024 ? null : setCollapsed(true)}
    >
      {/* Logo section */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <GraduationCap size={22} />
          </div>
          {!collapsed && (
            <div className="sidebar__logo-text animate-fade-in">
              <span className="sidebar__brand">L&D Portal</span>
              <span className="sidebar__subtitle">Training Management</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__section-label">
          {!collapsed && (isAdmin ? 'ADMINISTRATION' : 'TRAINING')}
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            title={collapsed ? link.label : undefined}
          >
            <link.icon size={20} className="sidebar__link-icon" />
            {!collapsed && <span className="sidebar__link-label">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.initials}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info animate-fade-in">
              <span className="sidebar__user-name">{user?.fullName}</span>
              <span className="sidebar__user-role">{user?.role}</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__logout"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
