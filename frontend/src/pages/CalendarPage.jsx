import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';

export default function CalendarPage() {
  const [fixtures, setFixtures] = useState([]);
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
    if (!selectedTournament) return;
    setLoading(true);
    api.get(`/fixtures/tournament/${selectedTournament}`)
      .then(({ data }) => setFixtures(data.fixtures))
      .finally(() => setLoading(false));
  }, [selectedTournament]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Calendario</h2>
        {tournaments.length > 1 && (
          <select value={selectedTournament} onChange={(e) => setSelectedTournament(e.target.value)}
            className="mb-4 border rounded-lg px-3 py-2">
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name} {t.year}</option>)}
          </select>
        )}
        {loading ? <p className="text-gray-400">Cargando...</p> : fixtures.map((fixture) => {
          const allPlayed = fixture.Matches?.every((m) => m.status === 'played');
          return (
            <div key={fixture.id} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-700">{fixture.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${allPlayed ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {allPlayed ? 'Finalizada' : 'En juego'}
                </span>
              </div>
              <div className="space-y-2">
                {fixture.Matches?.map((match) => {
                  const matchDate = match.match_date ? new Date(match.match_date) : null;
                  const dateStr = matchDate
                    ? matchDate.toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' })
                    : null;
                  const timeStr = matchDate
                    ? matchDate.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
                    : null;
                  return (
                  <div key={match.id} className="bg-white border rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm flex-1 text-right pr-3">{match.homeTeam?.name}</span>
                      <span className={`px-3 py-1 rounded text-sm font-bold ${match.status === 'played' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                        {match.status === 'played' ? `${match.home_score} - ${match.away_score}` : 'vs'}
                      </span>
                      <span className="font-medium text-sm flex-1 pl-3">{match.awayTeam?.name}</span>
                    </div>
                    {matchDate && (
                      <div className="text-center mt-1">
                        <span className="text-xs text-gray-400">📆 {dateStr} — {timeStr} hs</span>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
