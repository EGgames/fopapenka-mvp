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

// POST /api/matches/results/batch (FUNC-026b: cargar múltiples resultados a la vez)
const batchSetResults = async (req, res) => {
  const { sequelize } = require('../models');
  const transaction = await sequelize.transaction();

  try {
    const { results } = req.body; // Array de { match_id, home_score, away_score }

    if (!Array.isArray(results) || results.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Se requiere array de resultados' });
    }

    // Validar estructura de cada resultado
    for (const result of results) {
      if (!result.match_id || result.home_score === undefined || result.away_score === undefined) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Cada resultado debe tener match_id, home_score y away_score' });
      }
      if (!Number.isInteger(result.home_score) || !Number.isInteger(result.away_score) || result.home_score < 0 || result.away_score < 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Los goles deben ser enteros no negativos' });
      }
    }

    // Obtener todos los partidos de una vez
    const matchIds = results.map(r => r.match_id);
    const matches = await Match.findAll({ 
      where: { id: matchIds },
      transaction
    });
    
    if (matches.length !== matchIds.length) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Algunos partidos no existen' });
    }

    // Crear mapa de partidos
    const matchMap = {};
    matches.forEach(m => {
      matchMap[m.id] = m;
    });

    let totalPredictionsUpdated = 0;

    // Actualizar cada partido y recalcular pronósticos
    for (const result of results) {
      const match = matchMap[result.match_id];
      
      match.home_score = result.home_score;
      match.away_score = result.away_score;
      match.status = 'played';
      await match.save({ transaction });

      // Recalcular puntos de todos los pronósticos de este partido
      const predictions = await Prediction.findAll({ 
        where: { match_id: match.id },
        transaction
      });

      for (const prediction of predictions) {
        const points = calculatePoints({
          predictedHome: prediction.predicted_home,
          predictedAway: prediction.predicted_away,
          actualHome: result.home_score,
          actualAway: result.away_score,
        });
        await Score.upsert(
          { prediction_id: prediction.id, points },
          { transaction }
        );
      }

      totalPredictionsUpdated += predictions.length;
    }

    await transaction.commit();

    return res.json({ 
      success: true,
      saved: results.length,
      predictions_updated: totalPredictionsUpdated,
      message: `${results.length} resultado${results.length !== 1 ? 's' : ''} cargado${results.length !== 1 ? 's' : ''}. ${totalPredictionsUpdated} pronóstico${totalPredictionsUpdated !== 1 ? 's' : ''} recalculado${totalPredictionsUpdated !== 1 ? 's' : ''}.`
    });

  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/matches/:id  (admin — edita partido programado)
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    if (match.status === 'played') {
      return res.status(400).json({ error: 'No se puede editar un partido ya jugado' });
    }

    const { home_team_id, away_team_id, match_date } = req.body;
    const newHome = home_team_id !== undefined ? Number(home_team_id) : match.home_team_id;
    const newAway = away_team_id !== undefined ? Number(away_team_id) : match.away_team_id;

    if (newHome === newAway) {
      return res.status(400).json({ error: 'El equipo local y visitante no pueden ser el mismo' });
    }

    // Si cambian los equipos, eliminar pronósticos asociados (ya no son válidos)
    const teamsChanged = newHome !== match.home_team_id || newAway !== match.away_team_id;
    if (teamsChanged) {
      const predictions = await Prediction.findAll({ where: { match_id: match.id } });
      const predictionIds = predictions.map((p) => p.id);
      if (predictionIds.length > 0) {
        await Score.destroy({ where: { prediction_id: predictionIds } });
        await Prediction.destroy({ where: { match_id: match.id } });
      }
    }

    match.home_team_id = newHome;
    match.away_team_id = newAway;
    if (match_date !== undefined) match.match_date = match_date;
    await match.save();

    // Recargar con asociaciones de equipos
    const { Team } = require('../models');
    const updated = await Match.findByPk(match.id, {
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      ],
    });

    return res.json({ match: updated, predictions_deleted: teamsChanged });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/matches/:id  (admin — elimina partido programado)
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    if (match.status === 'played') {
      return res.status(400).json({ error: 'No se puede eliminar un partido ya jugado' });
    }

    // Eliminar scores, luego predicciones, luego el partido
    const predictions = await Prediction.findAll({ where: { match_id: match.id } });
    const predictionIds = predictions.map((p) => p.id);
    if (predictionIds.length > 0) {
      await Score.destroy({ where: { prediction_id: predictionIds } });
      await Prediction.destroy({ where: { match_id: match.id } });
    }
    await match.destroy();

    return res.json({ message: 'Partido eliminado correctamente' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { create, setResult, resetResult, batchSetResults, updateMatch, deleteMatch };
