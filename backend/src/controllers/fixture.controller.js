const { Fixture, Match, Team } = require('../models');

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

module.exports = { list, create };
