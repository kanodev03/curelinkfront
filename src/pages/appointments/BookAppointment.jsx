import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState({
    doctors: true,
    slots: false,
    booking: false
  });
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(prev => ({ ...prev, doctors: true }));
        const res = await API.get('/appointments/doctors');
        
        const doctorsArray = Array.isArray(res.data) ? res.data : res.data.doctors || [];
        
        if (doctorsArray.length === 0) {
          setError('No doctors available');
          setAlert({ type: 'info', message: 'No doctors available' });
        } else {
          setDoctors(doctorsArray);
          setError(null);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load doctors';
        setError(errorMsg);
        setAlert({ type: 'error', message: errorMsg });
      } finally {
        setLoading(prev => ({ ...prev, doctors: false }));
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDoctor && selectedDate) {
        setLoading(prev => ({ ...prev, slots: true }));
        try {
          const res = await API.get('/appointments/slots', {
            params: { doctorId: selectedDoctor._id, date: selectedDate }
          });
          
          const slotsArray = Array.isArray(res.data) ? res.data : res.data.slots || [];
          setAvailableSlots(slotsArray);
          setSelectedSlot('');
        } catch (err) {
          setAlert({ type: 'error', message: 'Failed to load slots' });
          setAvailableSlots([]);
        } finally {
          setLoading(prev => ({ ...prev, slots: false }));
        }
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setAlert({ type: 'error', message: 'Please select doctor, date and time' });
      return;
    }

    setLoading(prev => ({ ...prev, booking: true }));
    try {
      await API.post('/appointments/book', {
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: selectedSlot
      });
      setAlert({ type: 'success', message: 'Appointment booked. Redirecting to dashboard...' });
      setTimeout(() => window.location.href = '/dashboard', 1000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Booking failed' });
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              {error}
            </div>
          )}

          {/* Doctors Selection */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Select a Doctor</h2>
            </div>
            
            {loading.doctors ? (
              <div className="flex justify-center py-8 p-6">
                <LoadingSpinner />
              </div>
            ) : doctors.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {doctors.map(doctor => (
                    <div
                      key={doctor._id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className="p-4 rounded border-2 cursor-pointer transition"
                      style={{
                        borderColor: selectedDoctor?._id === doctor._id ? '#038474' : '#EEEEEE',
                        backgroundColor: selectedDoctor?._id === doctor._id ? '#F0F9F8' : '#FFFFFF'
                      }}
                    >
                      <p className="text-sm font-semibold text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-xs text-gray-600 mt-2">{doctor.specialization}</p>
                      {doctor.experience && (
                        <p className="text-xs text-gray-500 mt-1">{doctor.experience} yrs exp</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-600">No doctors available</div>
            )}
          </div>

          {/* Booking Form */}
          {selectedDoctor && (
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#F0F9F8' }}>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold text-gray-900">Dr. {selectedDoctor.name}</span> • <span className="text-gray-600">{selectedDoctor.specialization}</span>
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      max={maxDateStr}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#038474' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot *
                    </label>
                    {selectedDate ? (
                      loading.slots ? (
                        <div className="py-2">
                          <LoadingSpinner />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <select
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                          required
                        >
                          <option value="">-- Select time --</option>
                          {availableSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-gray-500 py-2">No slots available for this date</p>
                      )
                    ) : (
                      <p className="text-xs text-gray-500 py-2">Select date first</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBookAppointment}
                  disabled={loading.booking || !selectedDate || !selectedSlot}
                  className="w-full px-4 py-2 text-white text-sm font-medium rounded transition"
                  style={{
                    backgroundColor: loading.booking || !selectedDate || !selectedSlot ? '#BDBDBD' : '#038474'
                  }}
                >
                  {loading.booking ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}