import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
=======
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Sun, Moon } from 'lucide-react';
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname || (user.role === 'Admin' ? '/admin' : '/');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Premium Minimal Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-light rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      
      <div className="w-full max-w-[420px] p-6 relative z-10">
        <Card variant="featured">
          <CardContent className="p-10">
            <div className="relative">
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                <GraduationCap size={28} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-text tracking-tight">L&D Portal</h1>
              <p className="text-sm text-text-secondary mt-1.5 font-semibold tracking-wide uppercase">Training Management</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm font-medium rounded-xl flex items-center gap-3 animate-fade-in">
                <div className="w-1.5 h-1.5 bg-danger rounded-full shrink-0"></div>
=======
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-200 dark:from-[#060913] dark:via-[#0c1322] dark:to-[#070d18] relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Floating Theme Toggle with High Contrast Badge */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 shadow-md transition-all cursor-pointer z-20 flex items-center gap-2 text-xs font-bold"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      <div className="w-full max-w-[440px] p-6 relative z-10">
        <div className="bg-white dark:bg-[#111827] p-8 md:p-10 rounded-3xl shadow-2xl shadow-blue-950/10 dark:shadow-2xl dark:shadow-black/80 border border-slate-200/90 dark:border-slate-800 transition-colors duration-200">
          
          <div className="relative">
            <div className="flex flex-col items-center mb-7 text-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/25">
                <ShieldCheck size={30} className="text-white" strokeWidth={2.4} />
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                Samsung Electro-Mechanics
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Enterprise L&D Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Compliance & Training Management
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-fade-in">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0"></div>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                {error}
              </div>
            )}

<<<<<<< HEAD
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-secondary/50 group-focus-within:text-primary transition-colors" />
=======
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">
                  Corporate Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="h-4 w-4" />
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                    className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/50 font-medium text-sm"
=======
                    className="input-field text-xs py-3 w-full"
                    style={{ paddingLeft: '2.85rem' }}
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                    placeholder="name@company.com"
                  />
                </div>
              </div>

<<<<<<< HEAD
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-secondary/50 group-focus-within:text-primary transition-colors" />
=======
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="h-4 w-4" />
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                    className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/50 font-medium text-sm"
=======
                    className="input-field text-xs py-3 w-full"
                    style={{ paddingLeft: '2.85rem' }}
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
<<<<<<< HEAD
                className="w-full mt-4"
                size="lg"
=======
                className="w-full btn-primary py-3 rounded-xl text-xs font-bold mt-2 shadow-md hover:shadow-lg cursor-pointer"
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <span>Sign In to Training Portal</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </form>
<<<<<<< HEAD
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border">
          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            <span className="font-bold text-text uppercase tracking-widest block mb-2">Demo Credentials</span>
            Admin: arjun.kapoor@company.com<br />
            Employee: priya.sharma@company.com<br />
            <span className="text-text-secondary mt-1 block">Password: Training@123</span>
          </p>
=======

            {/* Quick Demo Fill Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                Quick Fill Demo Accounts:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEmail('arjun.kapoor@company.com'); setPassword('Training@123'); }}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer text-center"
                >
                  Admin / HR
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('priya.sharma@company.com'); setPassword('Training@123'); }}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-center"
                >
                  Employee
                </button>
              </div>
            </div>

            <div className="mt-5 text-center">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Knox SSO Integration Ready
              </span>
            </div>
          </div>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
        </div>
      </div>
    </div>
  );
}
