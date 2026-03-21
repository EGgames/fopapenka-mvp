import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/authStore';
import { useChatNotifStore } from '../store/chatNotifStore';
import { disconnectSocket, getSocket } from '../api/socket';
import api from '../api/client';

const navItems = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/predictions', label: 'Pronósticos', icon: '🎯' },
  { to: '/ranking', label: 'Ranking', icon: '🏆' },
  { to: '/chat', label: 'Chat', icon: '💬' },
];

export default function Layout({ children }) {
  const { nickname, penca, role, token } = useAuthStore(useShallow((s) => ({ nickname: s.nickname, penca: s.penca, role: s.role, token: s.token })));
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unread = useChatNotifStore((s) => s.unread);
  const toast = useChatNotifStore((s) => s.toast);
  const originalTitle = useRef(document.title);
  const prevUnread = useRef(0);

  // Cargar no leídos al montar + escuchar notificaciones socket
  useEffect(() => {
    if (!token) return;

    // Cargar conteo inicial
    api.get('/chat/unread').then(({ data }) => useChatNotifStore.getState().setUnread(data.unread)).catch(() => {});

    // Socket: escuchar notificaciones de nuevos mensajes
    let socket;
    let pollInterval;
    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (window.location.pathname !== '/chat') {
          api.get('/chat/unread').then(({ data }) => useChatNotifStore.getState().setUnread(data.unread)).catch(() => {});
        }
      }, 15000);
    };

    try {
      socket = getSocket();
      const handleNotif = (data) => {
        if (window.location.pathname !== '/chat') {
          useChatNotifStore.getState().increment();
          useChatNotifStore.getState().showToast(data);
          if (document.hidden && Notification.permission === 'granted') {
            new Notification(`💬 ${data.nickname}`, { body: data.content, tag: 'fopapenka-chat' });
          }
        }
      };
      socket.on('chat:notification', handleNotif);

      // Si el socket no conecta en 3s, usar polling (Vercel serverless no soporta WebSocket)
      const fallbackTimer = setTimeout(() => {
        if (!socket.connected) {
          socket.off('chat:notification', handleNotif);
          startPolling();
        }
      }, 3000);

      return () => {
        clearTimeout(fallbackTimer);
        socket.off('chat:notification', handleNotif);
        if (pollInterval) clearInterval(pollInterval);
      };
    } catch {
      startPolling();
      return () => { if (pollInterval) clearInterval(pollInterval); };
    }
  }, [token]);

  // Toast cuando polling detecta mensajes nuevos (sin socket)
  useEffect(() => {
    if (unread > prevUnread.current && prevUnread.current >= 0 && pathname !== '/chat') {
      const diff = unread - prevUnread.current;
      if (diff > 0 && diff <= 5) {
        useChatNotifStore.getState().showToast({ id: Date.now(), nickname: '', content: `${diff} mensaje${diff > 1 ? 's' : ''} nuevo${diff > 1 ? 's' : ''} en el chat` });
      }
    }
    prevUnread.current = unread;
  }, [unread, pathname]);

  // Actualizar título de pestaña con conteo
  useEffect(() => {
    if (unread > 0) {
      document.title = `(${unread}) ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [unread]);

  // Pedir permiso de notificaciones
  useEffect(() => {
    if (token && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [token]);

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
      {/* Toast notification */}
      {toast && (
        <div
          onClick={() => { useChatNotifStore.getState().hideToast(); navigate('/chat'); }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] bg-green-700 text-white rounded-xl shadow-2xl px-4 py-3 max-w-xs cursor-pointer animate-slide-in flex items-center gap-3 border border-green-600"
        >
          <span className="text-2xl">💬</span>
          <div className="flex-1 min-w-0">
            {toast.nickname && <p className="text-sm font-semibold truncate">{toast.nickname}</p>}
            <p className="text-sm opacity-90 truncate">{toast.content}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); useChatNotifStore.getState().hideToast(); }} className="text-green-200 hover:text-white text-lg ml-1">✕</button>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t sm:hidden z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`relative flex flex-col items-center py-2 px-3 text-xs ${pathname === item.to ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {item.to === '/chat' && unread > 0 && (
                <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
