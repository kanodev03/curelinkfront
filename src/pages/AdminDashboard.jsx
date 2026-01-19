import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import RoleGuard from '../components/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, appsRes] = await Promise.all([
          API.get('/admin/users'),
          API.get('/admin/appointments')
        ]);

        const users = usersRes.data;
        const appointments = appsRes.data;

        setStats({
          totalUsers: users.length,
          activeDoctors: users.filter(u => u.role === 'doctor' && u.isActive).length,
          totalAppointments: appointments.length,
        });
      } catch (err) {
        console.error(err);
        setAlert({ type: 'error', message: 'Failed to load admin stats' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Admin overview</h1>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              {[
                { name: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { name: 'Active Doctors', value: stats.activeDoctors, icon: '👨‍⚕️' },
                { name: 'Total Appointments', value: stats.totalAppointments, icon: '📅' },
              ].map((item, i) => (
                <div key={i} className="bg-white overflow-hidden rounded-lg border border-gray-200">
                  <div className="px-4 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{item.name}</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Admin actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  to="/admin/users"
                  className="block p-4 border border-gray-200 rounded text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  Manage users & doctors
                </Link>
                <Link
                  to="/admin/appointments"
                  className="block p-4 border border-gray-200 rounded text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  View all appointments
                </Link>
                <Link
                  to="/admin/records"
                  className="block p-4 border border-gray-200 rounded text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  View patient records
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}