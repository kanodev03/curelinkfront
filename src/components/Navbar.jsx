import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <nav style={{ backgroundColor: '#038474' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/abc.png" alt="CureLink Logo" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-white tracking-tight">
              CureLink
            </span>
          </Link>

          <div className="space-x-3 text-xs">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1 rounded border border-white text-white"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1 rounded bg-white text-[#038474]"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>
    );
  }

  const navItems = () => {
    switch (user.role) {
      case 'patient':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Appointments', path: '/appointments/book' },
          { name: 'Records', path: '/records' },
          { name: 'Medicines', path: '/medicines' },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Appointments', path: '/appointments' },
          { name: 'Add Record', path: '/records/new' },
          { name: 'Notes', path: '/admin/notes' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Users', path: '/admin/users' },
          { name: 'Appointments', path: '/admin/appointments' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav style={{ backgroundColor: '#038474' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/abc.png" alt="CureLink Logo" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-white tracking-tight">
              CureLink
            </span>
          </Link>
          <div className="hidden md:flex gap-3 text-xs text-white">
            {navItems().map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-2 py-1 rounded hover:bg-[#096187]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white">
          <span className="hidden sm:inline">
            {user.name} <span className="opacity-75">({user.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1 rounded border border-white"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}