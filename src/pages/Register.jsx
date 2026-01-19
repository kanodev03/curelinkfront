import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Alert from '../components/Alert';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    if (formData.role === 'doctor') {
      payload.specialization = formData.specialization;
    }

    try {
      const res = await API.post('/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      }));
      setAlert({ type: 'success', message: 'Registration successful. Redirecting to dashboard...' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#EEEEEE' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: '#038474' }}>Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium hover:text-[#096187]" style={{ color: '#038474' }}>
              Sign in
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}
          <div className="rounded-md shadow-sm space-y-4 bg-white p-6">
            <div>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                placeholder="Full Name"
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                placeholder="Email Address"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                placeholder="Password (min 6 chars)"
              />
            </div>
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === 'doctor' && (
              <div>
                <input
                  name="specialization"
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                  style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                  placeholder="Specialization (e.g., Cardiology)"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out shadow-md transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#038474', '--tw-ring-color': '#096187' }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}