const { Match, Prediction, Score } = require('../models');
const { calculatePoints } = require('../services/scoringService');

// POST /api/fixtures/:fixtureId/matches
const create = async (req, res) => {
  try {
    const { home_team_id, away_team_id, match_date } = req.body;
    if (home_team_id === away_team_id) {
      return res.status(400).json({ error: 'El equipo local y visitante no pueden ser el mismo' });
    }
    const match = await Match.create({ fixture_id: req.params.fixtureId, home_team_id, away_team_id, match_date });
    return res.status(201).json({ match });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/matches/:id/result  (admin — carga o corrige resultado)
const setResult = async (req, res) => {
  try {
    const { home_score, away_score } = req.body;
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    match.home_score = home_score;
    match.away_score = away_score;
    match.status = 'played';
    await match.save();

    // Recalcular puntos de todos los pronósticos de este partido
    const predictions = await Prediction.findAll({ where: { match_id: match.id } });
    for (const prediction of predictions) {
      const points = calculatePoints({
        predictedHome: prediction.predicted_home,
        predictedAway: prediction.predicted_away,
        actualHome: home_score,
        actualAway: away_score,
      });
      await Score.upsert({ prediction_id: prediction.id, points });
    }

    return res.json({ match, updated_predictions: predictions.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/matches/:id/result  (admin — resetea resultado a programado, solo non-production)
const resetResult = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'No disponible en producción' });
  }
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    match.home_score = null;
    match.away_score = null;
    match.status = 'scheduled';
    await match.save();
    // Borrar los Scores de los pronósticos de este partido
    const predictions = await Prediction.findAll({ where: { match_id: match.id } });
    const predictionIds = predictions.map((p) => p.id);
    if (predictionIds.length > 0) {
      await Score.destroy({ where: { prediction_id: predictionIds } });
    }
    return res.json({ match });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { create, setResult, resetResult };
