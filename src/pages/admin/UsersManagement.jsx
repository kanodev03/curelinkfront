import { useState, useEffect } from 'react';
import API from '../../services/api';
import RoleGuard from '../../components/RoleGuard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: 'TempPass123!',
    specialization: ''
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
      } catch (err) {
        console.error(err);
        setAlert({ type: 'error', message: 'Failed to load users' });
      } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/toggle`);
      fetchUsers(); // refresh
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to update user status' });
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/doctors', newDoctor);
      setAlert({ type: 'success', message: 'Doctor added successfully' });
      setAddingDoctor(false);
      setNewDoctor({ name: '', email: '', specialization: '' });
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add doctor' });
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Manage users</h1>
          <button
            onClick={() => setAddingDoctor(!addingDoctor)}
            className="px-4 py-2 text-xs font-medium rounded border border-gray-300 text-gray-800 hover:bg-gray-100"
          >
            {addingDoctor ? 'Cancel' : '+ Add Doctor'}
          </button>
        </div>

        {addingDoctor && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Add new doctor</h2>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Specialization"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                required
              />
              <button
                type="submit"
                className="w-full py-2 text-xs font-medium rounded text-white"
                style={{ backgroundColor: '#038474' }}
              >
                Add Doctor
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState 
            title="No users found" 
            description="There are no users in the system yet."
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            user.role === 'admin'
                              ? '#E3F2FD'
                              : user.role === 'doctor'
                              ? '#E0F2F1'
                              : '#FFF8E1',
                          color:
                            user.role === 'admin'
                              ? '#063A52'
                              : user.role === 'doctor'
                              ? '#04534A'
                              : '#8A6D1C',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: user.isActive ? '#E0F2F1' : '#FFEBEE',
                          color: user.isActive ? '#04534A' : '#8A1C1C',
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(user._id)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          user.isActive ? 'text-danger-600 hover:text-danger-900 hover:bg-danger-50' : 'text-success-600 hover:text-success-900 hover:bg-success-50'
                        } transition duration-150 ease-in-out`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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