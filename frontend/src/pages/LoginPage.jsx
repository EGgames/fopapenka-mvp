import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ invite_code: '', nickname: '', cedula: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth({ token: data.token, nickname: data.nickname, role: data.role, penca: data.penca });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de penca</label>
            <input name="invite_code" value={form.invite_code} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-3 py-2 uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tu apodo</label>
            <input name="nickname" value={form.nickname} onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula de identidad</label>
            <input name="cedula" value={form.cedula} onChange={handleChange}
              type="password" inputMode="numeric" className="mt-1 w-full border rounded-lg px-3 py-2" required />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
            Recordarme 7 días
          </label>
          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Primera vez en esta penca?{' '}
          <Link to="/register" className="text-green-600 font-medium">Registrarse</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          ¿Querés armar tu propia penca?{' '}
          <Link to="/create-penca" className="text-green-600 font-medium">Crear penca</Link>
        </p>
      </div>
    </div>
  );
}
