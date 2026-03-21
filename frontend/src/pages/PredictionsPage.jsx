import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';

export default function PredictionsPage() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingMatch, setSavingMatch] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');

  const [expandedMatch, setExpandedMatch] = useState(null);
  const [otherPredictions, setOtherPredictions] = useState([]);
  const [loadingOthers, setLoadingOthers] = useState(false);

  const toSlug = (name) => (name || '').toLowerCase().split(' ')[0];

  const handleToggleOthers = async (matchId) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
      setOtherPredictions([]);
      return;
    }
    setLoadingOthers(true);
    setExpandedMatch(matchId);
    try {
      const { data } = await api.get(`/predictions/match/${matchId}`);
      setOtherPredictions(data.predictions || []);
    } catch {
      setOtherPredictions([]);
    } finally {
      setLoadingOthers(false);
    }
  };

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

  // FUNC-026a: Guardar todos los pronósticos pendientes
  const handleSaveAll = async () => {
    setBatchMessage('');
    setSavingAll(true);
    
    try {
      // Recopilar todos los partidos con pronósticos completos
      const pendingPredictions = [];
      
      // Recorrer todas las fixtures y partidos del estado
      fixtures.forEach(fixture => {
        fixture.Matches?.forEach(match => {
          // Solo incluir partidos no jugados y que no hayan comenzado
          if (match.status === 'scheduled' && !(match.match_date && new Date() >= new Date(match.match_date))) {
            // Buscar valores en el DOM para este partido
            const matchSlug = `${toSlug(match.homeTeam?.name)}-${toSlug(match.awayTeam?.name)}-f${fixture.number}`;
            const matchRow = document.querySelector(`[data-match-id="${matchSlug}"]`);
            
            if (matchRow) {
              const homeInput = matchRow.querySelector('.home-goals');
              const awayInput = matchRow.querySelector('.away-goals');
              
              // Solo incluir si ambos campos están completos
              if (homeInput && awayInput && homeInput.value !== '' && awayInput.value !== '') {
                pendingPredictions.push({
                  match_id: match.id,
                  predicted_home: Number(homeInput.value),
                  predicted_away: Number(awayInput.value)
                });
              }
            }
          }
        });
      });

      if (pendingPredictions.length === 0) {
        setBatchMessage('ℹ️ No hay pronósticos pendientes para guardar');
        return;
      }

      // Enviar todos los pronósticos en una sola llamada
      const response = await api.post('/predictions/batch', { predictions: pendingPredictions });
      
      setBatchMessage(`✅ ${response.data.saved} pronóstico${response.data.saved !== 1 ? 's' : ''} guardado${response.data.saved !== 1 ? 's' : ''} exitosamente`);
      
      // Recargar datos
      await load();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setBatchMessage(''), 5000);
      
    } catch (error) {
      setBatchMessage(`❌ ${error.response?.data?.error || 'Error al guardar pronósticos'}`);
    } finally {
      setSavingAll(false);
    }
  };

  // Calcular cuántos pronósticos están pendientes de guardar
  const getPendingCount = () => {
    let count = 0;
    fixtures.forEach(fixture => {
      fixture.Matches?.forEach(match => {
        const matchStarted = match.match_date && new Date() >= new Date(match.match_date);
        if (match.status === 'scheduled' && !matchStarted && !predictions[match.id]) {
          count++;
        }
      });
    });
    return count;
  };

  const MatchRow = ({ match, fixtureNumber, fixtureName }) => {
    const pred = predictions[match.id];
    const [h, setH] = useState(pred?.predicted_home ?? '');
    const [a, setA] = useState(pred?.predicted_away ?? '');
    const played = match.status === 'played';
    const started = !played && match.match_date && new Date() >= new Date(match.match_date);
    const locked = played || started;
    const points = pred?.Score?.points;
    const matchSlug = `${toSlug(match.homeTeam?.name)}-${toSlug(match.awayTeam?.name)}-f${fixtureNumber}`;

    useEffect(() => {
      setH(pred?.predicted_home ?? '');
      setA(pred?.predicted_away ?? '');
    }, [pred]);

    const formatMatchDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div data-match-id={matchSlug} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-2 flex-wrap justify-between">
        {match.match_date && (
          <div className="w-full text-center mb-1">
            <span className="text-xs text-gray-400">🕐 {formatMatchDate(match.match_date)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{match.homeTeam?.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <input type="number" min="0" value={h} onChange={(e) => setH(e.target.value)}
            disabled={locked} className="w-12 border rounded text-center home-goals" />
          <span className="text-gray-400">-</span>
          <input type="number" min="0" value={a} onChange={(e) => setA(e.target.value)}
            disabled={locked} className="w-12 border rounded text-center away-goals" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium truncate text-right">{match.awayTeam?.name}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
          {!locked && (
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
          {started && (
            <>
              <span data-testid="match-locked" className="text-xs text-orange-500 match-locked">🔒 Partido en curso</span>
              {pred && (
                <span data-testid="prediction-badge" className="text-xs font-bold px-2 py-1 rounded-full prediction-saved bg-blue-100 text-blue-700">
                  {pred.predicted_home} - {pred.predicted_away}
                </span>
              )}
            </>
          )}
          {played && (
            <>
              <span data-testid="match-locked" className="text-xs text-gray-400 match-locked">Resultado: {match.home_score} - {match.away_score}</span>
              {pred && (
                <span data-testid="prediction-badge" className={`text-xs font-bold px-2 py-1 rounded-full prediction-saved ${points === 3 ? 'bg-green-100 text-green-700' : points === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {pred.predicted_home} - {pred.predicted_away} ({points ?? '-'} pts)
                </span>
              )}
              <button onClick={() => handleToggleOthers(match.id)} data-testid="view-others-btn"
                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition">
                {expandedMatch === match.id ? '▲ Cerrar' : '👁 Ver pronósticos'}
              </button>
            </>
          )}
        </div>
        {/* Tabla comparativa de pronósticos de otros */}
        {played && expandedMatch === match.id && (
          <div className="w-full mt-2 border-t pt-2" data-testid="others-predictions">
            {loadingOthers ? (
              <p className="text-xs text-gray-400 text-center py-2">Cargando...</p>
            ) : otherPredictions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Nadie pronosticó este partido.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="text-left py-1 px-2">Jugador</th>
                    <th className="text-center py-1 px-2">Pronóstico</th>
                    <th className="text-center py-1 px-2">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {otherPredictions
                    .sort((a, b) => (b.Score?.points ?? 0) - (a.Score?.points ?? 0))
                    .map((op) => (
                    <tr key={op.id} className="border-b last:border-0">
                      <td className="py-1 px-2 font-medium">{op.User?.nickname}</td>
                      <td className="py-1 px-2 text-center">{op.predicted_home} - {op.predicted_away}</td>
                      <td className="py-1 px-2 text-center">
                        <span className={`font-bold ${op.Score?.points === 3 ? 'text-green-600' : op.Score?.points === 1 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {op.Score?.points ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <Layout><div className="max-w-3xl mx-auto py-8 px-4"><p className="text-gray-400">Cargando...</p></div></Layout>;

  const hasPendingPredictions = fixtures.some(f => 
    f.Matches?.some(m => m.status === 'scheduled' && !(m.match_date && new Date() >= new Date(m.match_date)))
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🎯 Mis pronósticos</h2>
        </div>

        {/* FUNC-026a: Botón "Guardar todo" superior */}
        {hasPendingPredictions && (
          <div className="mb-4">
            <button 
              onClick={handleSaveAll}
              disabled={savingAll}
              data-testid="save-all-predictions-top"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {savingAll ? '⏳ Guardando todos los pronósticos...' : '💾 Guardar todos los pronósticos'}
            </button>
            {batchMessage && (
              <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${batchMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {batchMessage}
              </div>
            )}
          </div>
        )}

        {fixtures.length === 0
          ? <p className="text-gray-500">No hay partidos aún. Esperá que se carguen las fechas.</p>
          : fixtures.map((fixture) => {
            const matches = fixture.Matches || [];
            const scheduledCount = matches.filter((m) => m.status === 'scheduled').length;
            const predictedCount = matches.filter((m) => predictions[m.id]).length;
            return (
              <div key={fixture.id} data-fixture-id={fixture.id} className="mb-6">
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

        {/* FUNC-026a: Botón "Guardar todo" inferior */}
        {hasPendingPredictions && fixtures.length > 0 && (
          <div className="mt-6">
            <button 
              onClick={handleSaveAll}
              disabled={savingAll}
              data-testid="save-all-predictions-bottom"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {savingAll ? '⏳ Guardando todos los pronósticos...' : '💾 Guardar todos los pronósticos'}
            </button>
            {batchMessage && (
              <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${batchMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {batchMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
