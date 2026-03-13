import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/authStore';
import { disconnectSocket } from '../api/socket';

const navItems = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/predictions', label: 'Pronósticos', icon: '🎯' },
  { to: '/ranking', label: 'Ranking', icon: '🏆' },
  { to: '/chat', label: 'Chat', icon: '💬' },
];

export default function Layout({ children }) {
  const { nickname, penca, role } = useAuthStore(useShallow((s) => ({ nickname: s.nickname, penca: s.penca, role: s.role })));
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <header className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">⚽ Fopapenka</Link>
        <span className="text-green-200 text-sm" data-testid="penca-name">{penca}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{nickname}</span>
          {role === 'admin' && <Link to="/admin" className="text-xs bg-white text-green-700 px-2 py-1 rounded font-semibold">Admin</Link>}
          <button onClick={handleLogout} className="text-sm text-green-200 hover:text-white">Salir</button>
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t sm:hidden z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center py-2 px-3 text-xs ${pathname === item.to ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
