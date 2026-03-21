const { ChatMessage, ChatReadCursor, User } = require('../models');
const { Op } = require('sequelize');

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

// POST /api/chat — REST fallback for sending messages (serverless-compatible)
const send = async (req, res) => {
  try {
    const { pencaId, userId } = req.user;
    const message = await saveMessage({ pencaId, userId, content: req.body.content });
    return res.status(201).json({ message });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// PUT /api/chat/read — marca hasta qué mensaje leyó el usuario
const markRead = async (req, res) => {
  try {
    const { pencaId, userId } = req.user;
    const { last_read_message_id } = req.body;

    await ChatReadCursor.upsert({
      user_id: userId,
      penca_id: pencaId,
      last_read_message_id,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/chat/unread — cantidad de mensajes no leídos
const unreadCount = async (req, res) => {
  try {
    const { pencaId, userId } = req.user;

    const cursor = await ChatReadCursor.findOne({
      where: { user_id: userId, penca_id: pencaId },
    });
    const lastReadId = cursor?.last_read_message_id || 0;

    const count = await ChatMessage.count({
      where: {
        penca_id: pencaId,
        id: { [Op.gt]: lastReadId },
        user_id: { [Op.ne]: userId },
      },
    });

    return res.json({ unread: count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { saveMessage, history, send, markRead, unreadCount };
