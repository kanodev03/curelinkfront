import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Alert from '../components/Alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      }));
      setAlert({ type: 'success', message: 'Login successful. Redirecting to dashboard...' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#EEEEEE' }}>
      <div className="max-w-sm w-full space-y-6">
        <div>
          <h2 className="mt-2 text-center text-xl font-semibold" style={{ color: '#038474' }}>Sign in</h2>
          <p className="mt-1 text-center text-xs text-gray-600">
            New here?{' '}
            <a href="/register" className="font-medium" style={{ color: '#038474' }}>
              Create an account
            </a>
          </p>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}
          <div className="rounded-md space-y-3 bg-white p-5 border border-gray-200">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ borderColor: '#038474', '--tw-ring-color': '#038474' }}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out shadow-md transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#038474', '--tw-ring-color': '#096187' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}