import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function RankingPage() {
  const nickname = useAuthStore((s) => s.nickname);
  const [tab, setTab] = useState('tournament');
  const [ranking, setRanking] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tournaments').then(({ data }) => {
      setTournaments(data.tournaments);
      const active = data.tournaments.find((t) => t.status === 'active');
      if (active) setSelectedTournament(active.id);
    });
  }, []);

  useEffect(() => {
    if (tab === 'accumulated') {
      setLoading(true);
      api.get('/rankings/accumulated').then(({ data }) => setRanking(data.ranking)).finally(() => setLoading(false));
    } else if (selectedTournament) {
      setLoading(true);
      api.get(`/rankings/tournament/${selectedTournament}`).then(({ data }) => setRanking(data.ranking)).finally(() => setLoading(false));
    }
  }, [tab, selectedTournament]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Ranking</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('tournament')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'tournament' ? 'bg-green-600 text-white' : 'bg-white border'}`}>Por torneo</button>
          <button onClick={() => setTab('accumulated')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'accumulated' ? 'bg-green-600 text-white' : 'bg-white border'}`}>Acumulado</button>
        </div>
        {tab === 'tournament' && tournaments.length > 1 && (
          <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)} className="mb-4 border rounded-lg px-3 py-2">
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name} {t.year}</option>)}
          </select>
        )}
        {loading ? <p>Cargando...</p> : (
          <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
            <thead className="bg-green-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm">#</th>
                <th className="text-left px-4 py-2 text-sm">Jugador</th>
                <th className="text-right px-4 py-2 text-sm">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row) => {
                const medal = row.position === 1 ? '🥇' : row.position === 2 ? '🥈' : row.position === 3 ? '🥉' : null;
                return (
                <tr
                  key={row.id}
                  data-testid={row.nickname === nickname ? 'my-ranking-row' : 'ranking-row'}
                  data-current-user={row.nickname === nickname ? 'true' : undefined}
                  className={row.nickname === nickname ? 'bg-green-50 font-semibold' : ''}>
                  <td className="px-4 py-3 text-gray-500">{medal || row.position}</td>
                  <td className="px-4 py-3">{row.nickname} {row.nickname === nickname && '← vos'}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-bold" data-testid="ranking-points">{row.points ?? row.total_points}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
