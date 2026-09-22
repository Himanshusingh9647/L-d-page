import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import TrainingViewer from './pages/employee/TrainingViewer';
import Courses from './pages/employee/Courses';

// Admin Pages (Placeholders for now)
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeesList from './pages/admin/EmployeesList';
import AssignmentsMatrix from './pages/admin/AssignmentsMatrix';
import RecurringConfig from './pages/admin/RecurringConfig';
import AdminModules from './pages/admin/AdminModules';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />

<<<<<<< HEAD
            {/* Employee Routes */}
            <Route element={<MainLayout requiredRole="Employee" />}>
              <Route path="/" element={<EmployeeDashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/training/:moduleId" element={<TrainingViewer />} />
            </Route>
=======
              {/* Employee Routes */}
              <Route element={<MainLayout requiredRole="Employee" />}>
                <Route path="/" element={<EmployeeDashboard />} />
                <Route path="/training/:moduleId" element={<TrainingViewer />} />
              </Route>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad

              {/* Admin Routes */}
              <Route path="/admin" element={<MainLayout requiredRole="Admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="modules" element={<AdminModules />} />
                <Route path="employees" element={<EmployeesList />} />
                <Route path="assignments" element={<AssignmentsMatrix />} />
                <Route path="recurring" element={<RecurringConfig />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
