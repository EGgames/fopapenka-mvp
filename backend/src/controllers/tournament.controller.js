const { Tournament } = require('../models');

// GET /api/tournaments
const list = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const tournaments = await Tournament.findAll({ where: { penca_id: pencaId }, order: [['created_at', 'DESC']] });
    return res.json({ tournaments });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/tournaments
const create = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const { name, year, continuity_mode } = req.body;

    const active = await Tournament.findOne({ where: { penca_id: pencaId, status: 'active' } });
    if (active) return res.status(409).json({ error: 'Ya existe un torneo activo en esta penca' });

    const tournament = await Tournament.create({ penca_id: pencaId, name, year, continuity_mode });
    return res.status(201).json({ tournament });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/tournaments/:id/finish
const finish = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const tournament = await Tournament.findOne({ where: { id: req.params.id, penca_id: pencaId } });
    if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' });
    if (tournament.status === 'finished') return res.status(400).json({ error: 'El torneo ya está finalizado' });

    tournament.status = 'finished';
    await tournament.save();
    return res.json({ tournament });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { list, create, finish };
