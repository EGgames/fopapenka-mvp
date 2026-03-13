const { Prediction, Score, User, PencaMembership, Tournament, Fixture, Match, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Ranking de un torneo específico dentro de una penca.
 */
const getTournamentRanking = async (tournamentId, pencaId) => {
  const rows = await sequelize.query(
    `SELECT u.id, u.nickname,
            COALESCE(SUM(s.points), 0) AS points,
            COUNT(p.id) AS predictions_count
     FROM users u
     JOIN penca_memberships pm ON pm.user_id = u.id AND pm.penca_id = :pencaId AND pm.status = 'active'
     LEFT JOIN predictions p ON p.user_id = u.id AND p.penca_id = :pencaId
     LEFT JOIN matches m ON m.id = p.match_id
     LEFT JOIN fixtures f ON f.id = m.fixture_id AND f.tournament_id = :tournamentId
     LEFT JOIN scores s ON s.prediction_id = p.id
     GROUP BY u.id, u.nickname
     ORDER BY points DESC, u.nickname ASC`,
    { replacements: { pencaId, tournamentId }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r, i) => ({ position: i + 1, ...r }));
};

/**
 * Ranking acumulado de todos los torneos de una penca.
 */
const getAccumulatedRanking = async (pencaId) => {
  const rows = await sequelize.query(
    `SELECT u.id, u.nickname,
            COALESCE(SUM(s.points), 0) AS total_points,
            COUNT(DISTINCT t.id) AS tournaments_played
     FROM users u
     JOIN penca_memberships pm ON pm.user_id = u.id AND pm.penca_id = :pencaId AND pm.status = 'active'
     LEFT JOIN predictions p ON p.user_id = u.id AND p.penca_id = :pencaId
     LEFT JOIN matches m ON m.id = p.match_id
     LEFT JOIN fixtures f ON f.id = m.fixture_id
     LEFT JOIN tournaments t ON t.id = f.tournament_id AND t.penca_id = :pencaId
     LEFT JOIN scores s ON s.prediction_id = p.id
     GROUP BY u.id, u.nickname
     ORDER BY total_points DESC, u.nickname ASC`,
    { replacements: { pencaId }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r, i) => ({ position: i + 1, ...r }));
};

module.exports = { getTournamentRanking, getAccumulatedRanking };
