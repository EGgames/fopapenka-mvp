'use strict';
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

module.exports = {
  async up(queryInterface) {
    // ── 1. USUARIOS ──────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('12345678', SALT_ROUNDS);
    const hashes = await Promise.all([
      bcrypt.hash('11111111', SALT_ROUNDS), // Messi
      bcrypt.hash('22222222', SALT_ROUNDS), // Ronaldo
      bcrypt.hash('33333333', SALT_ROUNDS), // Mbappe
      bcrypt.hash('44444444', SALT_ROUNDS), // Neymar
    ]);

    await queryInterface.bulkInsert('users', [
      { nickname: 'AdminFopa', cedula_hash: adminHash, created_at: new Date(), updated_at: new Date() },
      { nickname: 'Messi',     cedula_hash: hashes[0], created_at: new Date(), updated_at: new Date() },
      { nickname: 'Ronaldo',   cedula_hash: hashes[1], created_at: new Date(), updated_at: new Date() },
      { nickname: 'Mbappe',    cedula_hash: hashes[2], created_at: new Date(), updated_at: new Date() },
      { nickname: 'Neymar',    cedula_hash: hashes[3], created_at: new Date(), updated_at: new Date() },
    ]);

    const [users] = await queryInterface.sequelize.query(
      `SELECT id, nickname FROM users ORDER BY id ASC`
    );
    const adminUser  = users.find(u => u.nickname === 'AdminFopa');
    const messiUser  = users.find(u => u.nickname === 'Messi');
    const ronaldoUser = users.find(u => u.nickname === 'Ronaldo');
    const mbappeUser = users.find(u => u.nickname === 'Mbappe');
    const neymarUser = users.find(u => u.nickname === 'Neymar');

    // ── 2. PENCA ─────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('pencas', [
      {
        name: 'Liga Amigos',
        invite_code: 'AMIGOS2026',
        status: 'active',
        created_by: adminUser.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const [[penca]] = await queryInterface.sequelize.query(
      `SELECT id FROM pencas WHERE invite_code = 'AMIGOS2026'`
    );

    // ── 3. MEMBRESÍAS ────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('penca_memberships', [
      { user_id: adminUser.id,   penca_id: penca.id, role: 'admin',  status: 'active', created_at: new Date(), updated_at: new Date() },
      { user_id: messiUser.id,   penca_id: penca.id, role: 'player', status: 'active', created_at: new Date(), updated_at: new Date() },
      { user_id: ronaldoUser.id, penca_id: penca.id, role: 'player', status: 'active', created_at: new Date(), updated_at: new Date() },
      { user_id: mbappeUser.id,  penca_id: penca.id, role: 'player', status: 'active', created_at: new Date(), updated_at: new Date() },
      { user_id: neymarUser.id,  penca_id: penca.id, role: 'player', status: 'active', created_at: new Date(), updated_at: new Date() },
    ]);

    // ── 4. TORNEO ─────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('tournaments', [
      {
        penca_id: penca.id,
        name: 'Apertura',
        year: 2026,
        continuity_mode: 'accumulate',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const [[tournament]] = await queryInterface.sequelize.query(
      `SELECT id FROM tournaments WHERE penca_id = ${penca.id} AND name = 'Apertura'`
    );

    // ── 5. EQUIPOS ───────────────────────────────────────────────────────────
    const teamNames = [
      'River Plate', 'Boca Juniors', 'Racing Club', 'Independiente',
      'San Lorenzo', 'Huracán', 'Vélez', 'Estudiantes',
    ];
    await queryInterface.bulkInsert('teams',
      teamNames.map(name => ({
        tournament_id: tournament.id,
        name,
        logo_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    const [teams] = await queryInterface.sequelize.query(
      `SELECT id, name FROM teams WHERE tournament_id = ${tournament.id} ORDER BY id ASC`
    );
    const teamByName = Object.fromEntries(teams.map(t => [t.name, t.id]));

    // ── 6. FIXTURES ───────────────────────────────────────────────────────────
    const fixtureData = [
      { number: 1, name: 'Fecha 1' },
      { number: 2, name: 'Fecha 2' },
      { number: 3, name: 'Fecha 3' },
    ];
    await queryInterface.bulkInsert('fixtures',
      fixtureData.map(f => ({
        tournament_id: tournament.id,
        ...f,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    const [fixtures] = await queryInterface.sequelize.query(
      `SELECT id, number FROM fixtures WHERE tournament_id = ${tournament.id} ORDER BY number ASC`
    );
    const fixtureByNumber = Object.fromEntries(fixtures.map(f => [f.number, f.id]));

    // ── 7. PARTIDOS ───────────────────────────────────────────────────────────
    // Fecha 1 — jugada (con resultados)
    // Fecha 2 — jugada (con resultados)
    // Fecha 3 — programada (sin resultados)
    const matchesData = [
      // Fecha 1 — jugada
      { fixture: 1, home: 'River Plate',   away: 'Boca Juniors',  hs: 2, as_: 1, status: 'played' },
      { fixture: 1, home: 'Racing Club',   away: 'Independiente', hs: 1, as_: 1, status: 'played' },
      { fixture: 1, home: 'San Lorenzo',   away: 'Huracán',       hs: 0, as_: 2, status: 'played' },
      { fixture: 1, home: 'Vélez',         away: 'Estudiantes',   hs: 3, as_: 0, status: 'played' },
      // Fecha 2 — jugada
      { fixture: 2, home: 'Boca Juniors',  away: 'Racing Club',   hs: 1, as_: 0, status: 'played' },
      { fixture: 2, home: 'Independiente', away: 'River Plate',   hs: 0, as_: 3, status: 'played' },
      { fixture: 2, home: 'Huracán',       away: 'Vélez',         hs: 2, as_: 2, status: 'played' },
      { fixture: 2, home: 'Estudiantes',   away: 'San Lorenzo',   hs: 1, as_: 1, status: 'played' },
      // Fecha 3 — programada
      { fixture: 3, home: 'River Plate',   away: 'Racing Club',   hs: null, as_: null, status: 'scheduled' },
      { fixture: 3, home: 'Boca Juniors',  away: 'Independiente', hs: null, as_: null, status: 'scheduled' },
      { fixture: 3, home: 'Vélez',         away: 'San Lorenzo',   hs: null, as_: null, status: 'scheduled' },
      { fixture: 3, home: 'Estudiantes',   away: 'Huracán',       hs: null, as_: null, status: 'scheduled' },
    ];

    await queryInterface.bulkInsert('matches',
      matchesData.map(m => ({
        fixture_id:   fixtureByNumber[m.fixture],
        home_team_id: teamByName[m.home],
        away_team_id: teamByName[m.away],
        home_score:   m.hs,
        away_score:   m.as_,
        status:       m.status,
        match_date:   null,
        created_at:   new Date(),
        updated_at:   new Date(),
      }))
    );

    const [matches] = await queryInterface.sequelize.query(
      `SELECT m.id, m.home_score, m.away_score, m.status,
              f.number AS fixture_number,
              ht.name AS home_name, at.name AS away_name
       FROM matches m
       JOIN fixtures f ON f.id = m.fixture_id
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       WHERE f.tournament_id = ${tournament.id}
       ORDER BY f.number, m.id`
    );

    // ── 8. PRONÓSTICOS ────────────────────────────────────────────────────────
    // Solo para fechas 1 y 2 (jugadas). Fecha 3 sin pronósticos aún.
    const playedMatches = matches.filter(m => m.status === 'played');

    // Pronósticos de cada jugador (con distintos niveles de acierto)
    const predictions = [];
    const playerPredictions = {
      [messiUser.id]: (hName, aName, hs, as_) => {
        // Messi: acierta bastante (marcador exacto en la mitad)
        if (hName === 'River Plate') return [2, 1];   // exacto
        if (hName === 'Racing Club') return [1, 1];   // exacto
        if (hName === 'San Lorenzo') return [0, 2];   // exacto
        if (hName === 'Vélez' && as_ === 0) return [2, 0];  // ganador correcto, dist marcador
        if (hName === 'Boca Juniors') return [1, 0];  // exacto
        if (hName === 'Independiente') return [0, 3]; // exacto
        if (hName === 'Huracán') return [1, 1];       // empate correcto, dist marcador
        return [0, 0]; // fallo
      },
      [ronaldoUser.id]: (hName, aName, hs, as_) => {
        // Ronaldo: acierta resultado pero no siempre el marcador
        if (hName === 'River Plate') return [3, 0];   // ganador correcto, dist marcador
        if (hName === 'Racing Club') return [0, 0];   // empate correcto, dist marcador
        if (hName === 'San Lorenzo') return [0, 1];   // visitante gana, correcto
        if (hName === 'Vélez' && as_ === 0) return [1, 0]; // ganador correcto
        if (hName === 'Boca Juniors') return [2, 0];  // ganador correcto
        if (hName === 'Independiente') return [1, 4]; // visitante gana, correcto
        if (hName === 'Huracán') return [0, 0];       // fallo (esperaba empate 0-0)
        return [1, 1]; // empate (fallo si no era empate)
      },
      [mbappeUser.id]: (hName, aName, hs, as_) => {
        // Mbappe: pocos aciertos
        return [1, 0]; // siempre predice 1-0 local, mayormente falla
      },
      [neymarUser.id]: (hName, aName, hs, as_) => {
        // Neymar: algunos aciertos
        if (hName === 'River Plate') return [2, 1]; // exacto
        if (hName === 'Vélez' && as_ === 0) return [3, 0]; // ganador correcto
        if (hName === 'Boca Juniors') return [0, 1]; // fallo
        return [0, 0]; // fallo
      },
    };

    for (const match of playedMatches) {
      for (const [userId, predictFn] of Object.entries(playerPredictions)) {
        const [ph, pa] = predictFn(match.home_name, match.away_name, match.home_score, match.away_score);
        predictions.push({
          user_id: parseInt(userId),
          match_id: match.id,
          penca_id: penca.id,
          predicted_home: ph,
          predicted_away: pa,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('predictions', predictions);

    // ── 9. SCORES ─────────────────────────────────────────────────────────────
    const [savedPredictions] = await queryInterface.sequelize.query(
      `SELECT p.id, p.predicted_home, p.predicted_away,
              m.home_score, m.away_score
       FROM predictions p
       JOIN matches m ON m.id = p.match_id
       WHERE p.penca_id = ${penca.id} AND m.status = 'played'`
    );

    const getResult = (h, a) => h > a ? 'home' : a > h ? 'away' : 'draw';
    const calculatePoints = (ph, pa, ah, aa) => {
      if (ph === ah && pa === aa) return 3;
      if (getResult(ph, pa) === getResult(ah, aa)) return 1;
      return 0;
    };

    await queryInterface.bulkInsert('scores',
      savedPredictions.map(p => ({
        prediction_id: p.id,
        points: calculatePoints(
          parseInt(p.predicted_home), parseInt(p.predicted_away),
          parseInt(p.home_score),     parseInt(p.away_score)
        ),
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );

    // ── 10. MENSAJES DE CHAT ──────────────────────────────────────────────────
    const chatMessages = [
      { user_id: messiUser.id,   content: '¡Vamos River! 🔴⚪' },
      { user_id: ronaldoUser.id, content: 'Esta fecha estuvo dura jajaj' },
      { user_id: mbappeUser.id,  content: '¿Alguien vio el gol de Vélez? Increíble' },
      { user_id: neymarUser.id,  content: 'Ya saqué 9 puntos en la fecha 1 😎' },
      { user_id: messiUser.id,   content: 'Yo también, empatados arriba' },
      { user_id: ronaldoUser.id, content: 'La fecha 3 va a estar peleada' },
      { user_id: adminUser.id,   content: 'Ya cargué la fecha 3, a pronósticar!' },
    ];

    await queryInterface.bulkInsert('chat_messages',
      chatMessages.map((m, i) => ({
        penca_id: penca.id,
        user_id: m.user_id,
        content: m.content,
        created_at: new Date(Date.now() + i * 60000), // 1 min de diferencia entre mensajes
        updated_at: new Date(Date.now() + i * 60000),
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('chat_messages', null, {});
    await queryInterface.bulkDelete('scores', null, {});
    await queryInterface.bulkDelete('predictions', null, {});
    await queryInterface.bulkDelete('matches', null, {});
    await queryInterface.bulkDelete('fixtures', null, {});
    await queryInterface.bulkDelete('teams', null, {});
    await queryInterface.bulkDelete('tournaments', null, {});
    await queryInterface.bulkDelete('penca_memberships', null, {});
    await queryInterface.bulkDelete('pencas', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
