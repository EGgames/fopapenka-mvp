const { ChatMessage, User } = require('../models');

// Guarda un mensaje (invocado desde el socket y desde la ruta REST)
const saveMessage = async ({ pencaId, userId, content }) => {
  const trimmed = content?.trim();
  if (!trimmed || trimmed.length > 500) throw new Error('Mensaje inválido');
  const message = await ChatMessage.create({ penca_id: pencaId, user_id: userId, content: trimmed });
  const full = await ChatMessage.findByPk(message.id, {
    include: [{ model: User, attributes: ['id', 'nickname'] }],
  });
  return full;
};

// GET /api/chat?before=<id>&limit=50
const history = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const where = { penca_id: pencaId };
    if (req.query.before) where.id = { [require('sequelize').Op.lt]: req.query.before };

    const messages = await ChatMessage.findAll({
      where,
      order: [['id', 'DESC']],
      limit,
      include: [{ model: User, attributes: ['id', 'nickname'] }],
    });
    return res.json({ messages: messages.reverse() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { saveMessage, history };
