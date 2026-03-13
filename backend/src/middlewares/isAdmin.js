const { PencaMembership } = require('../models');

const isAdmin = async (req, res, next) => {
  const { userId, pencaId } = req.user;
  const membership = await PencaMembership.findOne({
    where: { user_id: userId, penca_id: pencaId, status: 'active' },
  });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol de administrador en esta penca' });
  }
  next();
};

module.exports = { isAdmin };
