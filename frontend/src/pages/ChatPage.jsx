import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { getSocket } from '../api/socket';
import { useAuthStore } from '../store/authStore';
import { useChatNotifStore } from '../store/chatNotifStore';

export default function ChatPage() {
  const nickname = useAuthStore((s) => s.nickname);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const loadMessages = () =>
    api.get('/chat').then(({ data }) => {
      setMessages(data.messages);
      // Marcar como leído el último mensaje
      if (data.messages.length > 0) {
        const lastId = data.messages[data.messages.length - 1].id;
        api.put('/chat/read', { last_read_message_id: lastId }).catch(() => {});
        useChatNotifStore.getState().clear();
      }
    });

  useEffect(() => {
    loadMessages();

    // Try Socket.io; fall back to polling if it can't connect
    try {
      const socket = getSocket();
      socketRef.current = socket;
      socket.on('chat:message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        // Marcar como leído inmediatamente porque estamos en el chat
        api.put('/chat/read', { last_read_message_id: msg.id }).catch(() => {});
        useChatNotifStore.getState().clear();
      });

      // If socket fails to connect within 3s, start polling
      const fallbackTimer = setTimeout(() => {
        if (!socket.connected) {
          socketRef.current = null;
          const interval = setInterval(loadMessages, 3000);
          socket.off('chat:message');
          socket.disconnect();
          // Store interval for cleanup
          fallbackTimer._pollInterval = interval;
        }
      }, 3000);

      return () => {
        clearTimeout(fallbackTimer);
        if (fallbackTimer._pollInterval) clearInterval(fallbackTimer._pollInterval);
        socket.off('chat:message');
      };
    } catch {
      // No socket available, use polling
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText('');

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:send', { content });
    } else {
      await api.post('/chat', { content });
      await loadMessages();
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-64px)]">
        <h2 className="text-xl font-bold text-gray-800 px-4 pt-6 pb-2">💬 Chat de la penca</h2>
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          {messages.map((m) => (
            <div key={m.id} data-testid="chat-message" className={`chat-message flex ${m.User?.nickname === nickname ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 ${m.User?.nickname === nickname ? 'bg-green-600 text-white' : 'bg-white border text-gray-800'}`}>
                {m.User?.nickname !== nickname && <p className="text-xs font-semibold text-green-600 mb-1">{m.User?.nickname}</p>}
                <p className="text-sm">{m.content}</p>
                <p className="text-xs opacity-60 mt-1 text-right">{new Date(m.createdAt || m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 p-4 border-t bg-white">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
            data-testid="chat-input"
            placeholder="Escribí un mensaje..." className="flex-1 border rounded-full px-4 py-2 text-sm outline-none" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">Enviar</button>
        </form>
      </div>
    </Layout>
  );
}
