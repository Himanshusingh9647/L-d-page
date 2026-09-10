import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraduationCap, LayoutDashboard, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Toast from './Toast';

export default function Layout() {
  const { currentUser, state, dispatch } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const employees = state.users.filter((u) => u.role === 'employee');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Navigation ──────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 leading-none">Training Portal</h1>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Employee
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </NavLink>
            </div>

            {/* User switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-200 text-slate-700 text-xs font-semibold">
                  {currentUser?.initials}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {currentUser?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md border border-slate-200 shadow-lg z-40 py-1">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 mb-1">
                      Switch User
                    </p>
                    {employees.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          dispatch({ type: 'SET_CURRENT_USER', payload: user.id });
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${user.id === state.currentUserId
                            ? 'bg-slate-50 text-slate-900 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                          {user.initials}
                        </div>
                        <div className="text-left">
                          <p className="font-medium leading-tight">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page Content ────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* ── Toast ───────────────────────────────────────── */}
      <Toast />
    </div>
  );
}
