import { Given, When, Then, Before } from '@cucumber/cucumber';
import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';
const CEDULAS = { Ronaldo: '22222222', AdminFopa: '12345678' };

let currentMatchId = null;

const getAdminToken = async () => {
  const resp = await axios.post(`${API_BASE}/auth/login`, {
    invite_code: 'AMIGOS2026',
    nickname: 'AdminFopa',
    cedula: CEDULAS.AdminFopa,
  });
  return resp.data.token;
};

const getRonaldoToken = async () => {
  const resp = await axios.post(`${API_BASE}/auth/login`, {
    invite_code: 'AMIGOS2026',
    nickname: 'Ronaldo',
    cedula: CEDULAS.Ronaldo,
  });
  return resp.data.token;
};

// Antes de cada escenario: resetear todos los partidos de Fecha 3 a 'scheduled'
Before({ tags: '@scoring' }, async function () {
  const adminToken = await getAdminToken();
  const resp = await axios.get(`${API_BASE}/fixtures/tournament/1`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const fecha3 = resp.data.fixtures.find((f) => f.number === 3);
  if (!fecha3) return;
  for (const m of fecha3.Matches) {
    await axios.delete(`${API_BASE}/matches/${m.id}/result`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).catch(() => {});
  }
});

const getScheduledMatchId = async (adminToken) => {
  const resp = await axios.get(`${API_BASE}/fixtures/tournament/1`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const fecha3 = resp.data.fixtures.find((f) => f.number === 3);
  if (!fecha3) throw new Error('Fixture Fecha 3 no encontrada');
  const match = fecha3.Matches.find((m) => m.status === 'scheduled');
  if (!match) throw new Error('No quedan partidos programados en Fecha 3');
  return match.id;
};

// ─── Escenarios de puntuación (vía API, no UI) ───────────────────────────────

Given('que el jugador {string} pronosticó {int}-{int} en {string}', async function (nickname, home, away, _matchName) {
  const adminToken = await getAdminToken();
  const ronaldoToken = await getRonaldoToken();
  currentMatchId = await getScheduledMatchId(adminToken);

  // Upsert del pronóstico: intenta crear, si ya existe lo actualiza
  try {
    await axios.post(
      `${API_BASE}/predictions`,
      { match_id: currentMatchId, predicted_home: home, predicted_away: away },
      { headers: { Authorization: `Bearer ${ronaldoToken}` } },
    );
  } catch (err) {
    if (err.response?.status === 409 || err.response?.status === 400) {
      // Ya existe pronóstico — actualizar
      await axios.put(
        `${API_BASE}/predictions/match/${currentMatchId}`,
        { predicted_home: home, predicted_away: away },
        { headers: { Authorization: `Bearer ${ronaldoToken}` } },
      );
    } else {
      throw err;
    }
  }
});

When('el admin carga el resultado {int}-{int}', async function (home, away) {
  const adminToken = await getAdminToken();
  await axios.put(
    `${API_BASE}/matches/${currentMatchId}/result`,
    { home_score: home, away_score: away },
    { headers: { Authorization: `Bearer ${adminToken}` } },
  );
});

Then('el puntaje del jugador en ese partido debe ser {int}', async function (expectedPoints) {
  const ronaldoToken = await getRonaldoToken();
  const resp = await axios.get(`${API_BASE}/predictions/mine`, {
    headers: { Authorization: `Bearer ${ronaldoToken}` },
  });
  const pred = resp.data.predictions.find((p) => p.match_id === currentMatchId);
  if (!pred) throw new Error(`No se encontró pronóstico para el partido ${currentMatchId}`);
  const points = pred.Score?.points ?? 0;
  if (points !== expectedPoints) {
    throw new Error(`Se esperaban ${expectedPoints} puntos pero se obtuvieron ${points}`);
  }
});
