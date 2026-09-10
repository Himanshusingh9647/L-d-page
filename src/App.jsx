import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDetails from './pages/EmployeeDetails';
import ModuleViewer from './pages/ModuleViewer';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<EmployeeDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employee/:id" element={<EmployeeDetails />} />
            <Route path="/module/:id" element={<ModuleViewer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
