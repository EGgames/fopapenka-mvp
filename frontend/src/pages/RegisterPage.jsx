import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ invite_code: '', nickname: '', cedula: '' });
  const [pencaName, setPencaName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Busca el nombre de la penca cuando pierde el foco el campo de código
  const lookupPenca = async () => {
    if (!form.invite_code.trim()) return;
    try {
      const { data } = await api.get(`/pencas/${form.invite_code.trim().toUpperCase()}/info`);
      setPencaName(data.penca.name);
      setError('');
    } catch {
      setPencaName('');
      setError('Código de penca no válido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        invite_code: form.invite_code.toUpperCase(),
      });
      setAuth({ token: data.token, nickname: data.nickname, role: 'player', penca: data.penca });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <header>
          <h1 className="text-3xl font-bold text-green-700 text-center mb-6">⚽ Fopapenka</h1>
        </header>
        <p className="text-lg font-semibold text-center text-gray-700 mb-4">Unirse a una penca</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de invitación</label>
            <input name="invite_code" value={form.invite_code} onChange={handleChange}
              onBlur={lookupPenca}
              className="mt-1 w-full border rounded-lg px-3 py-2 uppercase" required />
            {pencaName && <p className="text-green-600 text-sm mt-1">Penca: <strong>{pencaName}</strong></p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Elegí tu apodo</label>
            <input name="nickname" value={form.nickname} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-3 py-2" required minLength={2} maxLength={30} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tu cédula de identidad</label>
            <input name="cedula" value={form.cedula} onChange={handleChange}
              type="password" inputMode="numeric" className="mt-1 w-full border rounded-lg px-3 py-2"
              required minLength={6} maxLength={15} />
            <p className="text-xs text-gray-400 mt-1">Solo números. Se usa como contraseña.</p>
          </div>
          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Registrando...' : 'Unirme a la penca'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-green-600 font-medium">Ingresar</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          ¿Querés armar tu propia penca?{' '}
          <Link to="/create-penca" className="text-green-600 font-medium">Crear penca</Link>
        </p>
      </div>
    </div>
  );
}
