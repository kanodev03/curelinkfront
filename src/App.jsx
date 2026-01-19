// frontend/src/App.jsx (FIXED)
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AICompanion from './components/AICompanion';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// New pages
import UsersManagement from './pages/admin/UsersManagement';
import AppointmentsList from './pages/admin/AppointmentsList';
import DoctorNotes from './pages/admin/DoctorNotes';
import PatientRecordsList from './pages/admin/PatientRecordsList';
import CreateRecord from './pages/records/CreateRecord';
import PatientRecords from './pages/records/PatientRecords';
import BookAppointment from './pages/appointments/BookAppointment';
import DoctorAppointments from './pages/appointments/DoctorAppointments';
import MedicineSearch from './pages/MedicineSearch';

// Dashboard Router Component
function DashboardRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage after component mounts
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  const hasToken = !!localStorage.getItem('token');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            {/* Dashboard - now uses proper routing */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            {/* Admin */}
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/appointments" element={<AppointmentsList />} />
            <Route path="/admin/notes" element={<DoctorNotes />} />
            <Route path="/admin/records" element={<PatientRecordsList />} />
            
            {/* Appointments */}
            <Route path="/appointments/book" element={<BookAppointment />} />
            <Route path="/appointments" element={<DoctorAppointments />} />
            
            {/* Records */}
            <Route path="/records/new" element={<CreateRecord />} />
            <Route path="/records" element={<PatientRecords />} />

            {/* Medicine Search */}
            <Route path="/medicines" element={<MedicineSearch />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* AI Companion for all authenticated users */}
      {hasToken && <AICompanion />}
    </div>
  );
}

export default App;