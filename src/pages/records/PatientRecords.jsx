import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get('/records');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        setAlert({ type: 'error', message: 'Failed to load medical records' });
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          ) : records.length === 0 ? (
            <div className="bg-white rounded border border-gray-200 p-8">
              <EmptyState 
                title="No medical records found" 
                description="You don't have any medical records yet. They will appear here after your visits."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {records.map(record => (
                <div key={record._id} className="bg-white rounded border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{record.diagnosis}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Dr. {record.doctorId.name} • {record.doctorId.specialization}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(record.visitDate)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2" style={{ color: '#038474' }}>Prescription</label>
                      <p className="text-sm text-gray-800 whitespace-pre-line">{record.prescription}</p>
                    </div>

                    {record.notes && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-2" style={{ color: '#038474' }}>Notes</label>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}