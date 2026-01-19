import { useState, useEffect } from 'react';
import API from '../services/api';
import RoleGuard from '../components/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get('/appointments');
        setAppointments(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load appointments' });
    } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime() && a.status === 'booked';
  });

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to update appointment' });
    }
  };

  return (
    <RoleGuard allowedRoles={['doctor']}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Doctor dashboard</h1>
          <div className="flex space-x-3">
            <a
              href="/admin/records"
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded text-white"
              style={{ backgroundColor: '#7B2CBF' }}
            >
              View All Patient Records
            </a>
            <a
              href="/appointments"
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded text-white"
              style={{ backgroundColor: '#096187' }}
            >
              View All Appointments
            </a>
            <a
              href="/records/new"
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded text-white"
              style={{ backgroundColor: '#038474' }}
            >
              + Add Medical Record
            </a>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Today&apos;s appointments</h2>
            </div>
            {todaysAppointments.length === 0 ? (
              <EmptyState 
                title="No appointments today" 
                description="You don't have any appointments scheduled for today."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: '#EEEEEE' }}>
                  <thead style={{ backgroundColor: '#EEEEEE' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#038474' }}>Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#038474' }}>Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#038474' }}>Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#038474' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y" style={{ borderColor: '#EEEEEE' }}>
                    {todaysAppointments.map((apt) => (
                      <tr key={apt._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{apt.patientId.name}</div>
                          <div className="text-sm text-gray-500">{apt.patientId.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.timeSlot}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white" style={{ backgroundColor: '#038474' }}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'completed')}
                            className="px-3 py-1 text-sm font-medium rounded-md text-white hover:shadow-md mr-3 transition duration-150 ease-in-out"
                            style={{ backgroundColor: '#038474' }}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                            className="px-3 py-1 text-sm font-medium rounded-md text-white hover:shadow-md transition duration-150 ease-in-out"
                            style={{ backgroundColor: '#D32F2F' }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}