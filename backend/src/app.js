require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const pencaRoutes = require('./routes/penca.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const teamRoutes = require('./routes/team.routes');
const fixtureRoutes = require('./routes/fixture.routes');
const matchRoutes = require('./routes/match.routes');
const predictionRoutes = require('./routes/prediction.routes');
const rankingRoutes = require('./routes/ranking.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pencas', pencaRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/chat', chatRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
