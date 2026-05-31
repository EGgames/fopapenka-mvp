const sequelize = require('../config/database');
const Penca = require('./Penca');
const User = require('./User');
const PencaMembership = require('./PencaMembership');
const Tournament = require('./Tournament');
const Team = require('./Team');
const Fixture = require('./Fixture');
const Match = require('./Match');
const Prediction = require('./Prediction');
const Score = require('./Score');
const ChatMessage = require('./ChatMessage');
const ChatReadCursor = require('./ChatReadCursor');
const Report = require('./Report');
const ReportComment = require('./ReportComment');
const ReportCommentReaction = require('./ReportCommentReaction');

// Penca <-> User (muchos a muchos via PencaMembership)
User.belongsToMany(Penca, { through: PencaMembership, foreignKey: 'user_id' });
Penca.belongsToMany(User, { through: PencaMembership, foreignKey: 'penca_id' });
PencaMembership.belongsTo(User, { foreignKey: 'user_id' });
PencaMembership.belongsTo(Penca, { foreignKey: 'penca_id' });
User.hasMany(PencaMembership, { foreignKey: 'user_id' });
Penca.hasMany(PencaMembership, { foreignKey: 'penca_id' });

// Penca -> Tournament
Penca.hasMany(Tournament, { foreignKey: 'penca_id' });
Tournament.belongsTo(Penca, { foreignKey: 'penca_id' });

// Tournament -> Team
Tournament.hasMany(Team, { foreignKey: 'tournament_id' });
Team.belongsTo(Tournament, { foreignKey: 'tournament_id' });

// Tournament -> Fixture
Tournament.hasMany(Fixture, { foreignKey: 'tournament_id' });
Fixture.belongsTo(Tournament, { foreignKey: 'tournament_id' });

// Fixture -> Match
Fixture.hasMany(Match, { foreignKey: 'fixture_id' });
Match.belongsTo(Fixture, { foreignKey: 'fixture_id' });

// Match -> Team (home / away)
Match.belongsTo(Team, { as: 'homeTeam', foreignKey: 'home_team_id' });
Match.belongsTo(Team, { as: 'awayTeam', foreignKey: 'away_team_id' });

// Match -> Prediction
Match.hasMany(Prediction, { foreignKey: 'match_id' });
Prediction.belongsTo(Match, { foreignKey: 'match_id' });

// User -> Prediction
User.hasMany(Prediction, { foreignKey: 'user_id' });
Prediction.belongsTo(User, { foreignKey: 'user_id' });

// Prediction -> Score (uno a uno)
Prediction.hasOne(Score, { foreignKey: 'prediction_id' });
Score.belongsTo(Prediction, { foreignKey: 'prediction_id' });

// Penca -> ChatMessage
Penca.hasMany(ChatMessage, { foreignKey: 'penca_id' });
ChatMessage.belongsTo(Penca, { foreignKey: 'penca_id' });

// User -> ChatMessage
User.hasMany(ChatMessage, { foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

// ChatReadCursor (user+penca -> último mensaje leído)
User.hasMany(ChatReadCursor, { foreignKey: 'user_id' });
ChatReadCursor.belongsTo(User, { foreignKey: 'user_id' });
Penca.hasMany(ChatReadCursor, { foreignKey: 'penca_id' });
ChatReadCursor.belongsTo(Penca, { foreignKey: 'penca_id' });

// User -> Report
User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

// Report -> ReportComment
Report.hasMany(ReportComment, { foreignKey: 'report_id' });
ReportComment.belongsTo(Report, { foreignKey: 'report_id' });

// User -> ReportComment
User.hasMany(ReportComment, { foreignKey: 'user_id' });
ReportComment.belongsTo(User, { foreignKey: 'user_id' });

// ReportComment -> Replies (self-referential)
ReportComment.hasMany(ReportComment, { as: 'Replies', foreignKey: 'parent_id' });
ReportComment.belongsTo(ReportComment, { as: 'Parent', foreignKey: 'parent_id' });

// ReportComment -> ReportCommentReaction
ReportComment.hasMany(ReportCommentReaction, { foreignKey: 'comment_id' });
ReportCommentReaction.belongsTo(ReportComment, { foreignKey: 'comment_id' });

// User -> ReportCommentReaction
User.hasMany(ReportCommentReaction, { foreignKey: 'user_id' });
ReportCommentReaction.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Penca,
  User,
  PencaMembership,
  Tournament,
  Team,
  Fixture,
  Match,
  Prediction,
  Score,
  ChatMessage,
  ChatReadCursor,
  Report,
  ReportComment,
  ReportCommentReaction,
};
