import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get('/admin/appointments');
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const handleDeleteAllAppointments = async () => {
    try {
      await API.delete('/appointments/all');
      setAlert({ type: 'success', message: 'All appointments deleted successfully' });
      setShowDeleteConfirm(false);
      setAppointments([]);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to delete appointments' });
    }
  };

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

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete All Appointments?</h3>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. All {appointments.length} appointment(s) will be permanently deleted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllAppointments}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">All appointments</h1>
          {appointments.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete All Appointments
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState 
            title="No appointments found" 
            description="There are no appointments in the system yet."
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map(apt => (
                  <tr key={apt._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{apt.patientId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Dr. {apt.doctorId.name} ({apt.doctorId.specialization})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(apt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{apt.timeSlot}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            apt.status === 'completed'
                              ? '#E0F2F1'
                              : apt.status === 'cancelled'
                              ? '#FFEBEE'
                              : '#FFF8E1',
                          color:
                            apt.status === 'completed'
                              ? '#04534A'
                              : apt.status === 'cancelled'
                              ? '#8A1C1C'
                              : '#8A6D1C',
                        }}
                      >
                        {apt.status}
                      </span>
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