const { Prediction, Score, Match, Team, Fixture, User } = require('../models');

// POST /api/predictions  (crear o actualizar pronóstico)
const upsert = async (req, res) => {
  try {
    const { userId, pencaId } = req.user;
    const { match_id, predicted_home, predicted_away } = req.body;

    const match = await Match.findByPk(match_id);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    if (match.status === 'played') return res.status(400).json({ error: 'No se puede pronosticar un partido ya jugado' });

    const existing = await Prediction.findOne({ where: { user_id: userId, match_id, penca_id: pencaId } });
    let prediction;
    let created = false;
    if (existing) {
      existing.predicted_home = predicted_home;
      existing.predicted_away = predicted_away;
      await existing.save();
      prediction = existing;
    } else {
      prediction = await Prediction.create({ user_id: userId, match_id, penca_id: pencaId, predicted_home, predicted_away });
      created = true;
    }
    return res.status(created ? 201 : 200).json({ prediction });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/predictions/mine  (mis pronósticos en el torneo activo de la penca)
const mine = async (req, res) => {
  try {
    const { userId, pencaId } = req.user;
    const predictions = await Prediction.findAll({
      where: { user_id: userId, penca_id: pencaId },
      include: [
        {
          model: Match,
          include: [
            { model: Team, as: 'homeTeam', attributes: ['id', 'name', 'logo_url'] },
            { model: Team, as: 'awayTeam', attributes: ['id', 'name', 'logo_url'] },
            { model: Fixture, attributes: ['id', 'number', 'name'] },
          ],
        },
        { model: Score, attributes: ['points'] },
      ],
      order: [[Match, Fixture, 'number', 'ASC']],
    });
    return res.json({ predictions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/predictions/match/:matchId  (actualizar pronóstico existente)
const update = async (req, res) => {
  try {
    const { userId, pencaId } = req.user;
    const { predicted_home, predicted_away } = req.body;
    const matchId = parseInt(req.params.matchId);

    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    if (match.status === 'played') return res.status(400).json({ error: 'No se puede pronosticar un partido ya jugado' });

    const prediction = await Prediction.findOne({ where: { user_id: userId, match_id: matchId, penca_id: pencaId } });
    if (!prediction) return res.status(404).json({ error: 'Pronóstico no encontrado' });

    prediction.predicted_home = predicted_home;
    prediction.predicted_away = predicted_away;
    await prediction.save();
    return res.json({ prediction });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/predictions/match/:matchId  (pronósticos de todos — solo si el partido fue jugado)
const byMatch = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const match = await Match.findByPk(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    if (match.status !== 'played') {
      return res.status(403).json({ error: 'Los pronósticos ajenos solo son visibles después del resultado' });
    }

    const predictions = await Prediction.findAll({
      where: { match_id: req.params.matchId, penca_id: pencaId },
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Score, attributes: ['points'] },
      ],
    });
    return res.json({ predictions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/predictions/batch (FUNC-026a: guardar múltiples pronósticos a la vez)
const batchUpsert = async (req, res) => {
  try {
    const { userId, pencaId } = req.user;
    const { predictions } = req.body; // Array de { match_id, predicted_home, predicted_away }

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(400).json({ error: 'Se requiere array de pronósticos' });
    }

    // Validar estructura de cada pronóstico
    for (const pred of predictions) {
      if (!pred.match_id || pred.predicted_home === undefined || pred.predicted_away === undefined) {
        return res.status(400).json({ error: 'Cada pronóstico debe tener match_id, predicted_home y predicted_away' });
      }
      if (!Number.isInteger(pred.predicted_home) || !Number.isInteger(pred.predicted_away) || pred.predicted_home < 0 || pred.predicted_away < 0) {
        return res.status(400).json({ error: 'Los goles deben ser enteros no negativos' });
      }
    }

    // Obtener todos los partidos de una vez
    const matchIds = predictions.map(p => p.match_id);
    const matches = await Match.findAll({ where: { id: matchIds } });
    
    if (matches.length !== matchIds.length) {
      return res.status(404).json({ error: 'Algunos partidos no existen' });
    }

    // Verificar que ningún partido esté jugado
    const playedMatches = matches.filter(m => m.status === 'played');
    if (playedMatches.length > 0) {
      return res.status(400).json({ 
        error: 'No se pueden guardar pronósticos de partidos ya jugados',
        played_match_ids: playedMatches.map(m => m.id)
      });
    }

    // Obtener pronósticos existentes
    const existingPredictions = await Prediction.findAll({
      where: { 
        user_id: userId, 
        match_id: matchIds, 
        penca_id: pencaId 
      }
    });

    const existingPredMap = {};
    existingPredictions.forEach(p => {
      existingPredMap[p.match_id] = p;
    });

    const created = [];
    const updated = [];

    // Upsert cada pronóstico
    for (const pred of predictions) {
      const existing = existingPredMap[pred.match_id];
      if (existing) {
        // Actualizar existente
        existing.predicted_home = pred.predicted_home;
        existing.predicted_away = pred.predicted_away;
        await existing.save();
        updated.push(existing);
      } else {
        // Crear nuevo
        const newPred = await Prediction.create({
          user_id: userId,
          match_id: pred.match_id,
          penca_id: pencaId,
          predicted_home: pred.predicted_home,
          predicted_away: pred.predicted_away
        });
        created.push(newPred);
      }
    }

    return res.json({ 
      success: true,
      saved: predictions.length,
      created: created.length,
      updated: updated.length,
      message: `${predictions.length} pronóstico${predictions.length !== 1 ? 's' : ''} guardado${predictions.length !== 1 ? 's' : ''} exitosamente`
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { upsert, update, mine, byMatch, batchUpsert };
