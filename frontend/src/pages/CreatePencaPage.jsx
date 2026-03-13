import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function CreatePencaPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ penca_name: '', invite_code: '', nickname: '', cedula: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'invite_code' ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/pencas/create-with-admin', form);
      setAuth({ token: data.token, nickname: data.nickname, role: data.role, penca: data.penca });
      setCreated(data.invite_code);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la penca');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">¡Penca creada!</h1>
          <p className="text-gray-600 mb-4">Compartí este código con tus amigos para que se unan:</p>
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <p className="text-3xl font-bold text-green-700 tracking-wider font-mono">{created}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">Sos el administrador de <strong>{form.penca_name}</strong></p>
          <button onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <header>
          <h1 className="text-3xl font-bold text-green-700 text-center mb-2">⚽ Fopapenka</h1>
          <p className="text-center text-gray-500 mb-6">Creá tu propia penca</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la penca</label>
            <input name="penca_name" value={form.penca_name} onChange={handleChange}
              placeholder="Ej: Liga Amigos" className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de invitación</label>
            <input name="invite_code" value={form.invite_code} onChange={handleChange}
              placeholder="Ej: AMIGOS2026" maxLength={20} className="mt-1 w-full border rounded-lg px-3 py-2 uppercase font-mono tracking-wider" required />
            <p className="text-xs text-gray-400 mt-1">Letras y números, mínimo 4 caracteres. Este código lo usarán tus amigos para unirse.</p>
          </div>
          <hr className="my-2" />
          <p className="text-sm text-gray-500">Tus datos como administrador:</p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tu apodo</label>
            <input name="nickname" value={form.nickname} onChange={handleChange}
              placeholder="Ej: ElAdmin" className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula de identidad</label>
            <input name="cedula" value={form.cedula} onChange={handleChange}
              type="password" inputMode="numeric" placeholder="Tu cédula como contraseña"
              className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? 'Creando...' : 'Crear Penca'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés código?{' '}
          <Link to="/login" className="text-green-600 font-medium">Ingresar</Link>
          {' · '}
          <Link to="/register" className="text-green-600 font-medium">Registrarse</Link>
        </p>
      </div>
    </div>
  );
}
