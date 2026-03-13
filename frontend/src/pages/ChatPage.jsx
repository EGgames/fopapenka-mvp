import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { getSocket } from '../api/socket';
import { useAuthStore } from '../store/authStore';

export default function ChatPage() {
  const nickname = useAuthStore((s) => s.nickname);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat').then(({ data }) => setMessages(data.messages));
    const socket = getSocket();
    socket.on('chat:message', (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off('chat:message');
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket().emit('chat:send', { content: text.trim() });
    setText('');
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
