import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import { Trash2 } from 'lucide-react';

export default function PatientRecordsList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get('/records/all');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load patient records' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const handleDeleteRecord = async (recordId) => {
    try {
      await API.delete(`/records/${recordId}`);
      setAlert({ type: 'success', message: 'Record deleted successfully' });
      setDeleteConfirm(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to delete record' });
    }
  };

  const handleDeleteAllRecords = async () => {
    try {
      await API.delete('/records/all');
      setAlert({ type: 'success', message: 'All records deleted successfully' });
      setDeleteConfirm(null);
      setRecords([]);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to delete records' });
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'doctor']}>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {deleteConfirm === 'all' ? 'Delete All Records?' : 'Delete Record?'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {deleteConfirm === 'all'
                  ? `This action cannot be undone. All ${records.length} record(s) will be permanently deleted.`
                  : 'This action cannot be undone. The record will be permanently deleted.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm === 'all') {
                      handleDeleteAllRecords();
                    } else {
                      handleDeleteRecord(deleteConfirm);
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {userRole === 'admin' ? 'All Patient Records' : 'Patient Records'}
          </h1>
          {userRole === 'admin' && records.length > 0 && (
            <button
              onClick={() => setDeleteConfirm('all')}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete All Records
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <EmptyState 
            title="No patient records found" 
            description="There are no medical records in the system yet."
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription</th>
                  {userRole === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map(record => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{record.patientId.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      Dr. {record.doctorId.name}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{record.diagnosis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(record.visitDate)}</td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{record.prescription}</td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setDeleteConfirm(record._id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
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
