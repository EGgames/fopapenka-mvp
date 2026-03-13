const { getTournamentRanking, getAccumulatedRanking } = require('../services/rankingService');

// GET /api/rankings/tournament/:tournamentId
const tournament = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const ranking = await getTournamentRanking(req.params.tournamentId, pencaId);
    return res.json({ ranking });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/rankings/accumulated
const accumulated = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const ranking = await getAccumulatedRanking(pencaId);
    return res.json({ ranking });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { tournament, accumulated };
