import { useState, useEffect } from 'react';
import API from '../services/api';
import RoleGuard from '../components/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

export default function PatientDashboard() {
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

  const upcoming = appointments.filter(a => 
    new Date(a.date) >= new Date() && a.status === 'booked'
  );
  const past = appointments.filter(a => 
    new Date(a.date) < new Date()
  );

  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        {/* Header */}
        <div className="py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#EEEEEE' }}>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Patient dashboard</h1>
            <div className="flex space-x-3">
              <a 
                href="/records" 
                className="px-4 py-2 text-sm font-medium rounded text-white"
                style={{ backgroundColor: '#096187' }}
              >
                Records
              </a>
              <a 
                href="/appointments/book" 
                className="px-4 py-2 text-sm font-medium rounded text-white"
                style={{ backgroundColor: '#038474' }}
              >
                + Appointment
              </a>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-semibold mb-3 text-gray-900">Upcoming appointments</h2>
                {upcoming.length === 0 ? (
                  <EmptyState 
                    title="No upcoming appointments" 
                    description="You don't have any upcoming appointments."
                  />
                ) : (
                  <ul className="space-y-2">
                    {upcoming.map((apt) => (
                      <li key={apt._id} className="px-4 py-3 border rounded" style={{ borderColor: '#EEEEEE' }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{new Date(apt.date).toDateString()}</p>
                            <p className="text-xs text-gray-600">{apt.timeSlot} • {apt.doctorId.name}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: '#E8F5E9', color: '#038474' }}>
                            {apt.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Past Appointments */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-semibold mb-3 text-gray-900">Past appointments</h2>
                {past.length === 0 ? (
                  <EmptyState 
                    title="No past appointments" 
                    description="Your past appointments will appear here after your visit."
                  />
                ) : (
                  <ul className="space-y-2">
                    {past.map((apt) => (
                      <li key={apt._id} className="px-4 py-3 border rounded" style={{ borderColor: '#EEEEEE' }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{new Date(apt.date).toDateString()}</p>
                            <p className="text-xs text-gray-600">{apt.timeSlot} • {apt.doctorId.name}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: apt.status === 'completed' ? '#E8F5E9' : '#FFEBEE', color: apt.status === 'completed' ? '#038474' : '#D32F2F' }}>
                            {apt.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}