const { Fixture, Match, Team, Tournament } = require('../models');
const { Op } = require('sequelize');

// GET /api/tournaments/:tournamentId/fixtures
const list = async (req, res) => {
  try {
    const fixtures = await Fixture.findAll({
      where: { tournament_id: req.params.tournamentId },
      order: [['number', 'ASC']],
      include: [{
        model: Match,
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'logo_url'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'logo_url'] },
        ],
      }],
    });
    return res.json({ fixtures });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/fixtures/calendar — FUNC-012: Ver calendario completo del torneo activo
const getCalendar = async (req, res) => {
  try {
    const { pencaId } = req.user;
    
    // Buscar torneo activo de la penca
    const tournament = await Tournament.findOne({
      where: { penca_id: pencaId, status: 'active' },
    });
    
    if (!tournament) {
      return res.status(404).json({ error: 'No hay torneo activo en esta penca' });
    }

    const fixtures = await Fixture.findAll({
      where: { tournament_id: tournament.id },
      order: [['number', 'ASC'], [{ model: Match, as: 'Matches' }, 'match_datetime', 'ASC']],
      include: [{
        model: Match,
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'logo_url'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'logo_url'] },
        ],
        order: [['match_datetime', 'ASC']],
      }],
    });

    // Enriquecer datos con estado de partido e indicador de tiempo
    const now = new Date();
    const enrichedFixtures = fixtures.map(fixture => ({
      id: fixture.id,
      name: fixture.name,
      number: fixture.number,
      matches: fixture.Matches.map(match => {
        const matchDate = new Date(match.match_datetime);
        const isUpcoming = matchDate > now && match.status === 'programado';
        const hoursUntilStart = isUpcoming ? Math.floor((matchDate - now) / (1000 * 60 * 60)) : null;
        
        return {
          id: match.id,
          home_team: match.homeTeam,
          away_team: match.awayTeam,
          match_datetime: match.match_datetime,
          status: match.status,
          home_goals: match.home_goals,
          away_goals: match.away_goals,
          is_upcoming: isUpcoming,
          hours_until_start: hoursUntilStart,
        };
      }),
    }));

    return res.json({ 
      tournament: { id: tournament.id, name: tournament.name },
      fixtures: enrichedFixtures 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/tournaments/:tournamentId/fixtures
const create = async (req, res) => {
  try {
    const { number, name } = req.body;
    const fixture = await Fixture.create({ tournament_id: req.params.tournamentId, number, name });
    return res.status(201).json({ fixture });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una fixture con ese número en este torneo' });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { list, getCalendar, create };
