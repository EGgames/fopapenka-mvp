const { Team, Tournament } = require('../models');

// GET /api/tournaments/:tournamentId/teams
const list = async (req, res) => {
  try {
    const teams = await Team.findAll({ where: { tournament_id: req.params.tournamentId }, order: [['name', 'ASC']] });
    return res.json({ teams });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/tournaments/:tournamentId/teams
const create = async (req, res) => {
  try {
    const { name, logo_url } = req.body;
    const team = await Team.create({ tournament_id: req.params.tournamentId, name, logo_url });
    return res.status(201).json({ team });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un equipo con ese nombre en este torneo' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/teams/:id
const remove = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
    await team.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { list, create, remove };
