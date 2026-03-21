import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';

const tabs = [
  { id: 'tournament', label: '🏆 Torneo' },
  { id: 'teams', label: '📋 Equipos' },
  { id: 'fixtures', label: '📅 Fechas' },
  { id: 'results', label: '⚽ Resultados' },
  { id: 'members', label: '👥 Jugadores' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('tournament');
  const [tournaments, setTournaments] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);

  useEffect(() => {
    api.get('/tournaments').then(({ data }) => {
      setTournaments(data.tournaments);
      setActiveTournament(data.tournaments.find((t) => t.status === 'active') || null);
    });
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Panel de Administración</h2>
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === t.id ? 'bg-green-600 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'tournament' && (
          <TournamentTab activeTournament={activeTournament} tournaments={tournaments}
            onCreated={(t) => { setTournaments((prev) => [t, ...prev]); setActiveTournament(t); }}
            onFinished={(t) => { setTournaments((prev) => prev.map((x) => x.id === t.id ? t : x)); setActiveTournament(null); }} />
        )}
        {activeTab === 'teams' && activeTournament && <TeamsTab tournamentId={activeTournament.id} />}
        {activeTab === 'fixtures' && activeTournament && <FixturesTab tournamentId={activeTournament.id} />}
        {activeTab === 'results' && activeTournament && <ResultsTab tournamentId={activeTournament.id} />}
        {activeTab === 'members' && <MembersTab />}
        {!activeTournament && activeTab !== 'tournament' && activeTab !== 'members' && (
          <p className="text-gray-500 text-center py-8">Creá un torneo primero para gestionar {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}.</p>
        )}
      </div>
    </Layout>
  );
}

/* ─── TOURNAMENT TAB ──────────────────────────────────────── */
function TournamentTab({ activeTournament, tournaments, onCreated, onFinished }) {
  const handleFinish = async () => {
    if (!confirm('¿Finalizar el torneo actual? No se puede deshacer.')) return;
    const { data } = await api.patch(`/tournaments/${activeTournament.id}/finish`);
    onFinished(data.tournament);
  };

  return (
    <div className="space-y-4">
      {activeTournament ? (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Torneo activo</p>
              <p className="text-xl font-bold text-green-700">{activeTournament.name} {activeTournament.year}</p>
              <p className="text-sm text-gray-400 mt-1">Modo: {activeTournament.continuity_mode === 'accumulate' ? 'Acumular puntos' : 'Reiniciar ranking'}</p>
            </div>
            <button onClick={handleFinish} className="text-sm bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100">Finalizar torneo</button>
          </div>
        </div>
      ) : (
        <NewTournamentForm onCreated={onCreated} />
      )}
      {tournaments.filter((t) => t.status === 'finished').length > 0 && (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Torneos anteriores</h3>
          <div className="space-y-2">
            {tournaments.filter((t) => t.status === 'finished').map((t) => (
              <div key={t.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                <span className="font-medium">{t.name} {t.year}</span>
                <span className="text-gray-400">Finalizado</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewTournamentForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), continuity_mode: 'accumulate' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tournaments', { ...form, year: Number(form.year) });
      onCreated(data.tournament);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear torneo');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-700">Crear nuevo torneo</h3>
      <input placeholder="Nombre (ej: Apertura 2026)" value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="w-full border rounded-lg px-3 py-2" required />
      <input type="number" placeholder="Año" value={form.year}
        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
        className="w-full border rounded-lg px-3 py-2" required />
      <select value={form.continuity_mode} onChange={(e) => setForm((f) => ({ ...f, continuity_mode: e.target.value }))}
        className="w-full border rounded-lg px-3 py-2">
        <option value="accumulate">Acumular puntos del anterior</option>
        <option value="reset">Reiniciar ranking desde cero</option>
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold w-full">Crear torneo</button>
    </form>
  );
}

/* ─── TEAMS TAB ───────────────────────────────────────────── */
function TeamsTab({ tournamentId }) {
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get(`/teams/tournament/${tournamentId}`).then(({ data }) => setTeams(data.teams));
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/teams/tournament/${tournamentId}`, { name: name.trim() });
      setName('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar equipo');
    }
  };

  const handleRemove = async (id, teamName) => {
    if (!confirm(`¿Eliminar ${teamName}?`)) return;
    await api.delete(`/teams/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-white border rounded-xl p-4 shadow-sm flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del equipo"
          className="flex-1 border rounded-lg px-3 py-2" required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Agregar</button>
      </form>
      {error && <p className="text-red-500 text-sm px-1">{error}</p>}
      <div className="bg-white border rounded-xl shadow-sm divide-y">
        {teams.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No hay equipos cargados aún.</p>
        ) : teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium text-gray-800">{t.name}</span>
            <button onClick={() => handleRemove(t.id, t.name)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">{teams.length} equipo{teams.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

/* ─── FIXTURES TAB ────────────────────────────────────────── */
function FixturesTab({ tournamentId }) {
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ number: '', name: '' });
  const [matchForm, setMatchForm] = useState({ fixture_id: '', home_team_id: '', away_team_id: '', match_date: '' });
  const [editingMatch, setEditingMatch] = useState(null); // { id, home_team_id, away_team_id, match_date }
  const [error, setError] = useState('');

  const load = useCallback(() => {
    Promise.all([
      api.get(`/fixtures/tournament/${tournamentId}`),
      api.get(`/teams/tournament/${tournamentId}`),
    ]).then(([fRes, tRes]) => {
      setFixtures(fRes.data.fixtures);
      setTeams(tRes.data.teams);
    });
  }, [tournamentId]);

  useEffect(() => { load(); }, [load]);

  const handleCreateFixture = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/fixtures/tournament/${tournamentId}`, { number: Number(form.number), name: form.name.trim() });
      setForm({ number: '', name: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear fecha');
    }
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (matchForm.home_team_id === matchForm.away_team_id) {
      setError('El equipo local y visitante no pueden ser el mismo');
      return;
    }
    setError('');
    try {
      await api.post(`/matches/fixture/${matchForm.fixture_id}`, {
        home_team_id: Number(matchForm.home_team_id),
        away_team_id: Number(matchForm.away_team_id),
        ...(matchForm.match_date ? { match_date: new Date(matchForm.match_date).toISOString() } : {}),
      });
      setMatchForm((f) => ({ ...f, home_team_id: '', away_team_id: '', match_date: '' }));
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar partido');
    }
  };

  const handleEditMatch = async (e) => {
    e.preventDefault();
    if (editingMatch.home_team_id === editingMatch.away_team_id) {
      setError('El equipo local y visitante no pueden ser el mismo');
      return;
    }
    setError('');
    try {
      await api.put(`/matches/${editingMatch.id}`, {
        home_team_id: Number(editingMatch.home_team_id),
        away_team_id: Number(editingMatch.away_team_id),
        ...(editingMatch.match_date ? { match_date: new Date(editingMatch.match_date).toISOString() } : {}),
      });
      setEditingMatch(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar partido');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('¿Eliminar este partido? Se borrarán los pronósticos asociados.')) return;
    setError('');
    try {
      await api.delete(`/matches/${matchId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar partido');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateFixture} className="bg-white border rounded-xl p-4 shadow-sm flex gap-2 flex-wrap">
        <input type="number" min="1" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          placeholder="Nº" className="w-16 border rounded-lg px-3 py-2" required />
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nombre (ej: Fecha 4)" className="flex-1 border rounded-lg px-3 py-2" required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Crear fecha</button>
      </form>

      {fixtures.length > 0 && teams.length >= 2 && (
        <form onSubmit={handleAddMatch} className="bg-white border rounded-xl p-4 shadow-sm flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-gray-500">Fecha</label>
            <select value={matchForm.fixture_id} onChange={(e) => setMatchForm((f) => ({ ...f, fixture_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2" required>
              <option value="">Seleccionar</option>
              {fixtures.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-gray-500">Local</label>
            <select value={matchForm.home_team_id} onChange={(e) => setMatchForm((f) => ({ ...f, home_team_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2" required>
              <option value="">Seleccionar</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-gray-500">Visitante</label>
            <select value={matchForm.away_team_id} onChange={(e) => setMatchForm((f) => ({ ...f, away_team_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2" required>
              <option value="">Seleccionar</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-gray-500">Fecha y hora</label>
            <input type="datetime-local" value={matchForm.match_date}
              onChange={(e) => setMatchForm((f) => ({ ...f, match_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Agregar partido</button>
        </form>
      )}

      {error && <p className="text-red-500 text-sm px-1">{error}</p>}

      {fixtures.map((fixture) => (
        <div key={fixture.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-green-50 px-4 py-2 flex justify-between items-center">
            <span className="font-semibold text-green-800">{fixture.name}</span>
            <span className="text-xs text-gray-400">{fixture.Matches?.length || 0} partidos</span>
          </div>
          {fixture.Matches?.length > 0 ? (
            <div className="divide-y">
              {fixture.Matches.map((m) => {
                const fmtDate = m.match_date ? new Date(m.match_date).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + new Date(m.match_date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }) : null;
                const isEditing = editingMatch?.id === m.id;

                if (isEditing) {
                  return (
                    <form key={m.id} onSubmit={handleEditMatch} className="px-4 py-2 bg-yellow-50 flex gap-2 flex-wrap items-end">
                      <div className="flex-1 min-w-[100px]">
                        <label className="text-xs text-gray-500">Local</label>
                        <select value={editingMatch.home_team_id} onChange={(e) => setEditingMatch((f) => ({ ...f, home_team_id: e.target.value }))}
                          className="w-full border rounded-lg px-2 py-1 text-sm" required>
                          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="text-xs text-gray-500">Visitante</label>
                        <select value={editingMatch.away_team_id} onChange={(e) => setEditingMatch((f) => ({ ...f, away_team_id: e.target.value }))}
                          className="w-full border rounded-lg px-2 py-1 text-sm" required>
                          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[130px]">
                        <label className="text-xs text-gray-500">Fecha y hora</label>
                        <input type="datetime-local" value={editingMatch.match_date}
                          onChange={(e) => setEditingMatch((f) => ({ ...f, match_date: e.target.value }))}
                          className="w-full border rounded-lg px-2 py-1 text-sm" />
                      </div>
                      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">Guardar</button>
                      <button type="button" onClick={() => setEditingMatch(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm">Cancelar</button>
                    </form>
                  );
                }

                return (
                  <div key={m.id} className="px-4 py-2 flex items-center justify-between text-sm">
                    <span className="flex-1 text-right pr-2 font-medium">{m.homeTeam?.name}</span>
                    <div className="flex flex-col items-center">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${m.status === 'played' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.status === 'played' ? `${m.home_score} - ${m.away_score}` : 'vs'}
                      </span>
                      {fmtDate && <span className="text-[10px] text-gray-400 mt-0.5">🕐 {fmtDate}</span>}
                    </div>
                    <span className="flex-1 pl-2 font-medium">{m.awayTeam?.name}</span>
                    {m.status === 'scheduled' && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => {
                          const localDate = m.match_date ? new Date(m.match_date).toISOString().slice(0, 16) : '';
                          setEditingMatch({ id: m.id, home_team_id: String(m.home_team_id), away_team_id: String(m.away_team_id), match_date: localDate });
                        }} className="text-blue-500 hover:text-blue-700 text-xs" title="Editar">✏️</button>
                        <button onClick={() => handleDeleteMatch(m.id)} className="text-red-400 hover:text-red-600 text-xs" title="Eliminar">🗑️</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-3 text-xs">Sin partidos</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── RESULTS TAB ─────────────────────────────────────────── */
function ResultsTab({ tournamentId }) {
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [saving, setSaving] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [batchMessage, setBatchMessage] = useState('');

  const load = useCallback(() => {
    api.get(`/fixtures/tournament/${tournamentId}`).then(({ data }) => {
      setFixtures(data.fixtures);
      if (!selectedFixture && data.fixtures.length > 0) {
        const pending = data.fixtures.find((f) => f.Matches?.some((m) => m.status === 'scheduled'));
        setSelectedFixture(pending?.id || data.fixtures[data.fixtures.length - 1]?.id);
      }
    });
  }, [tournamentId, selectedFixture]);

  useEffect(() => { load(); }, [load]);

  const handleSetResult = async (matchId, homeScore, awayScore) => {
    setError('');
    setSaving(matchId);
    try {
      await api.put(`/matches/${matchId}/result`, { home_score: Number(homeScore), away_score: Number(awayScore) });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar resultado');
    } finally {
      setSaving(null);
    }
  };

  // FUNC-026b: Guardar todos los resultados pendientes
  const handleSaveAllResults = async () => {
    setBatchMessage('');
    setError('');
    setSavingAll(true);
    
    try {
      const currentFixture = fixtures.find((f) => f.id === selectedFixture);
      if (!currentFixture || !currentFixture.Matches) {
        setBatchMessage('ℹ️ No hay partidos en esta fecha');
        return;
      }

      // Recopilar todos los resultados con valores completos
      const pendingResults = [];
      
      currentFixture.Matches.forEach(match => {
        const matchRow = document.querySelector(`[data-match-id="${match.id}"]`);
        if (matchRow) {
          const homeInput = matchRow.querySelector('.home-score-input');
          const awayInput = matchRow.querySelector('.away-score-input');
          
          if (homeInput && awayInput && homeInput.value !== '' && awayInput.value !== '') {
            pendingResults.push({
              match_id: match.id,
              home_score: Number(homeInput.value),
              away_score: Number(awayInput.value)
            });
          }
        }
      });

      if (pendingResults.length === 0) {
        setBatchMessage('ℹ️ No hay resultados completos para cargar');
        return;
      }

      // Enviar todos los resultados en una sola llamada
      const response = await api.post('/matches/results/batch', { results: pendingResults });
      
      setBatchMessage(`✅ ${response.data.saved} resultado${response.data.saved !== 1 ? 's' : ''} cargado${response.data.saved !== 1 ? 's' : ''}. ${response.data.predictions_updated} pronóstico${response.data.predictions_updated !== 1 ? 's' : ''} recalculado${response.data.predictions_updated !== 1 ? 's' : ''}.`);
      
      // Recargar datos
      load();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setBatchMessage(''), 5000);
      
    } catch (err) {
      setBatchMessage(`❌ ${err.response?.data?.error || 'Error al cargar resultados'}`);
    } finally {
      setSavingAll(false);
    }
  };

  const currentFixture = fixtures.find((f) => f.id === selectedFixture);
  const hasPendingResults = currentFixture?.Matches?.some(m => 
    m.home_score === null || m.away_score === null
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {fixtures.map((f) => {
          const allPlayed = f.Matches?.every((m) => m.status === 'played');
          const somePlayed = f.Matches?.some((m) => m.status === 'played');
          return (
            <button key={f.id} onClick={() => setSelectedFixture(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${selectedFixture === f.id ? 'bg-green-600 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {f.name}
              {allPlayed && <span className="text-xs">✅</span>}
              {!allPlayed && somePlayed && <span className="text-xs">🔶</span>}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* FUNC-026b: Botón "Guardar todos los resultados" superior */}
      {hasPendingResults && currentFixture?.Matches?.length > 0 && (
        <div>
          <button 
            onClick={handleSaveAllResults}
            disabled={savingAll}
            data-testid="save-all-results-top"
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {savingAll ? '⏳ Guardando todos los resultados...' : '💾 Guardar todos los resultados'}
          </button>
          {batchMessage && (
            <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${batchMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {batchMessage}
            </div>
          )}
        </div>
      )}

      {currentFixture?.Matches?.map((match) => (
        <ResultMatchCard key={match.id} match={match} saving={saving === match.id}
          onSave={(h, a) => handleSetResult(match.id, h, a)} />
      ))}

      {currentFixture && !currentFixture.Matches?.length && (
        <p className="text-gray-400 text-center py-6 text-sm">Esta fecha no tiene partidos cargados.</p>
      )}

      {/* FUNC-026b: Botón "Guardar todos los resultados" inferior */}
      {hasPendingResults && currentFixture?.Matches?.length > 0 && (
        <div className="mt-4">
          <button 
            onClick={handleSaveAllResults}
            disabled={savingAll}
            data-testid="save-all-results-bottom"
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {savingAll ? '⏳ Guardando todos los resultados...' : '💾 Guardar todos los resultados'}
          </button>
          {batchMessage && (
            <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${batchMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {batchMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultMatchCard({ match, saving, onSave }) {
  const [h, setH] = useState(match.home_score ?? '');
  const [a, setA] = useState(match.away_score ?? '');
  const played = match.status === 'played';

  const fmtDate = match.match_date ? new Date(match.match_date).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + new Date(match.match_date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div data-match-id={match.id} className={`bg-white border rounded-xl p-4 shadow-sm ${played ? 'border-green-200' : ''}`}>
      {fmtDate && (
        <p className="text-xs text-gray-400 text-center mb-2">🕐 {fmtDate}</p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-medium text-sm flex-1 text-right">{match.homeTeam?.name}</span>
        <div className="flex items-center gap-2">
          <input type="number" min="0" value={h} onChange={(e) => setH(e.target.value)}
            className="w-14 border rounded-lg text-center py-1 text-lg font-bold home-score-input" />
          <span className="text-gray-400 font-bold">-</span>
          <input type="number" min="0" value={a} onChange={(e) => setA(e.target.value)}
            className="w-14 border rounded-lg text-center py-1 text-lg font-bold away-score-input" />
        </div>
        <span className="font-medium text-sm flex-1">{match.awayTeam?.name}</span>
        <button onClick={() => onSave(h, a)} disabled={saving || h === '' || a === ''}
          className={`text-sm px-4 py-2 rounded-lg font-semibold ${played ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-50`}>
          {saving ? '...' : played ? 'Corregir' : 'Cargar'}
        </button>
      </div>
      {played && (
        <p className="text-xs text-green-600 mt-2 text-center">✅ Resultado cargado: {match.home_score} - {match.away_score}</p>
      )}
    </div>
  );
}

/* ─── MEMBERS TAB ─────────────────────────────────────────── */
function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/pencas/members').then(({ data }) => setMembers(data.members)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await api.patch(`/pencas/members/${userId}/status`, { status: newStatus });
    load();
  };

  if (loading) return <p className="text-gray-400 text-center py-6">Cargando...</p>;

  return (
    <div className="bg-white border rounded-xl shadow-sm divide-y">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="font-medium text-gray-800">{m.User?.nickname}</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              {m.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${m.status === 'active' ? 'text-green-600' : 'text-red-400'}`}>
              {m.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
            {m.role !== 'admin' && (
              <button onClick={() => toggleStatus(m.user_id, m.status)}
                className={`text-xs px-3 py-1 rounded-lg ${m.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {m.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="px-4 py-3 text-center text-xs text-gray-400">
        {members.length} miembro{members.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
