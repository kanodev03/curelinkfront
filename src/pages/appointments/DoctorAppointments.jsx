import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';

export default function DoctorAppointments() {
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

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
      setAlert({ type: 'success', message: `Appointment ${status} successfully` });
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to update appointment' });
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <RoleGuard allowedRoles={['doctor']}>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">My appointments</h1>
          <a
            href="/dashboard"
            className="px-3 py-2 text-xs font-medium rounded text-white"
            style={{ backgroundColor: '#096187' }}
          >
            Back to Dashboard
          </a>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState 
            title="No appointments found" 
            description="You don't have any appointments scheduled yet."
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{apt.patientId.name}</div>
                      <div className="text-sm text-gray-500">{apt.patientId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.timeSlot}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            apt.status === 'completed'
                              ? '#E0F2F1'
                              : apt.status === 'cancelled'
                              ? '#FFEBEE'
                              : '#E3F2FD',
                          color:
                            apt.status === 'completed'
                              ? '#04534A'
                              : apt.status === 'cancelled'
                              ? '#8A1C1C'
                              : '#063A52',
                        }}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {apt.status === 'booked' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'completed')}
                            className="px-3 py-1 text-sm font-medium rounded-md text-success-600 hover:text-success-700 hover:bg-success-50 mr-3 transition duration-150 ease-in-out"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                            className="px-3 py-1 text-sm font-medium rounded-md text-danger-600 hover:text-danger-700 hover:bg-danger-50 transition duration-150 ease-in-out"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}