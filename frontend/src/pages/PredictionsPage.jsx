import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';

export default function PredictionsPage() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState(null);

  const toSlug = (name) => (name || '').toLowerCase().split(' ')[0];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tourRes, predRes] = await Promise.all([
        api.get('/tournaments'),
        api.get('/predictions/mine'),
      ]);
      const active = tourRes.data.tournaments.find((t) => t.status === 'active');
      if (active) {
        const fixRes = await api.get(`/fixtures/tournament/${active.id}`);
        setFixtures(fixRes.data.fixtures);
      }
      const predMap = {};
      for (const p of predRes.data.predictions) {
        predMap[p.match_id] = p;
      }
      setPredictions(predMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePredict = async (matchId, home, away) => {
    setSavingMatch(matchId);
    try {
      await api.post('/predictions', { match_id: matchId, predicted_home: Number(home), predicted_away: Number(away) });
      await load();
    } finally {
      setSavingMatch(null);
    }
  };

  const MatchRow = ({ match, fixtureNumber, fixtureName }) => {
    const pred = predictions[match.id];
    const [h, setH] = useState(pred?.predicted_home ?? '');
    const [a, setA] = useState(pred?.predicted_away ?? '');
    const played = match.status === 'played';
    const points = pred?.Score?.points;
    const matchSlug = `${toSlug(match.homeTeam?.name)}-${toSlug(match.awayTeam?.name)}-f${fixtureNumber}`;

    useEffect(() => {
      setH(pred?.predicted_home ?? '');
      setA(pred?.predicted_away ?? '');
    }, [pred]);

    return (
      <div data-match-id={matchSlug} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{match.homeTeam?.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <input type="number" min="0" value={h} onChange={(e) => setH(e.target.value)}
            disabled={played} className="w-12 border rounded text-center home-goals" />
          <span className="text-gray-400">-</span>
          <input type="number" min="0" value={a} onChange={(e) => setA(e.target.value)}
            disabled={played} className="w-12 border rounded text-center away-goals" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium truncate text-right">{match.awayTeam?.name}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
          {!played && (
            <>
              <button onClick={() => handlePredict(match.id, h, a)}
                disabled={savingMatch === match.id || h === '' || a === ''}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg save-prediction disabled:opacity-50">
                {savingMatch === match.id ? '...' : 'Guardar'}
              </button>
              {pred && (
                <span data-testid="prediction-badge" className="text-xs font-bold px-2 py-1 rounded-full prediction-saved bg-blue-100 text-blue-700">
                  {pred.predicted_home} - {pred.predicted_away}
                </span>
              )}
            </>
          )}
          {played && (
            <>
              <span data-testid="match-locked" className="text-xs text-gray-400 match-locked">No se puede pronosticar un partido ya jugado</span>
              {pred && (
                <span data-testid="prediction-badge" className={`text-xs font-bold px-2 py-1 rounded-full prediction-saved ${points === 3 ? 'bg-green-100 text-green-700' : points === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {pred.predicted_home} - {pred.predicted_away} ({points ?? '-'} pts)
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <Layout><div className="max-w-3xl mx-auto py-8 px-4"><p className="text-gray-400">Cargando...</p></div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Mis pronósticos</h2>
        {fixtures.length === 0
          ? <p className="text-gray-500">No hay partidos aún. Esperá que se carguen las fechas.</p>
          : fixtures.map((fixture) => {
            const matches = fixture.Matches || [];
            const scheduledCount = matches.filter((m) => m.status === 'scheduled').length;
            const predictedCount = matches.filter((m) => predictions[m.id]).length;
            return (
              <div key={fixture.id} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-700">{fixture.name}</h3>
                  <div className="flex gap-2 text-xs">
                    {scheduledCount > 0 && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {predictedCount}/{matches.length} cargados
                      </span>
                    )}
                    {scheduledCount === 0 && (
                      <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Finalizada</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <MatchRow key={match.id} match={match} fixtureNumber={fixture.number} fixtureName={fixture.name} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </Layout>
  );
}
