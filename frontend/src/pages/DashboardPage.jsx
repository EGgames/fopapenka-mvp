import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import api from '../api/client';

export default function DashboardPage() {
  const { nickname, penca, role } = useAuthStore(useShallow((s) => ({ nickname: s.nickname, penca: s.penca, role: s.role })));
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/predictions/mine').catch(() => ({ data: { predictions: [] } })),
      api.get('/tournaments').catch(() => ({ data: { tournaments: [] } })),
    ]).then(async ([predRes, tourRes]) => {
      const active = tourRes.data.tournaments.find((t) => t.status === 'active');
      let myRank = null;
      if (active) {
        try {
          const { data } = await api.get(`/rankings/tournament/${active.id}`);
          myRank = data.ranking.find((r) => r.nickname === nickname);
        } catch {}
      }
      const preds = predRes.data.predictions;
      const scored = preds.filter((p) => p.Score);
      const totalPoints = scored.reduce((sum, p) => sum + (p.Score?.points || 0), 0);
      const exactas = scored.filter((p) => p.Score?.points === 3).length;
      setStats({ totalPredictions: preds.length, totalPoints, exactas, rank: myRank });
    });
  }, [nickname]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">¡Hola, {nickname}! 👋</h2>
        <p className="text-gray-500 mb-6">Penca: <span className="font-semibold text-green-600" data-testid="penca-name">{penca}</span></p>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700">{stats.totalPoints}</p>
              <p className="text-xs text-gray-500">Puntos</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700">{stats.exactas}</p>
              <p className="text-xs text-gray-500">Exactas</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700">{stats.rank?.position ?? '-'}</p>
              <p className="text-xs text-gray-500">Posición</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {[
            { to: '/predictions', label: '🎯 Pronósticos', desc: 'Cargar y ver tus predicciones' },
            { to: '/ranking', label: '🏆 Ranking', desc: 'Tabla de posiciones' },
            { to: '/calendar', label: '📅 Calendario', desc: 'Ver fechas y partidos' },
            { to: '/chat', label: '💬 Chat', desc: 'Charlar con los participantes' },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="text-xl font-bold text-gray-800">{item.label}</div>
              <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
            </Link>
          ))}
          {role === 'admin' && (
            <Link to="/admin"
              className="bg-green-600 text-white border rounded-xl p-5 shadow-sm hover:bg-green-700 transition col-span-2">
              <div className="text-xl font-bold">⚙️ Panel Admin</div>
              <div className="text-sm text-green-100 mt-1">Gestionar torneo, fixtures y resultados</div>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
