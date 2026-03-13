const bcrypt = require('bcrypt');
const { Penca, PencaMembership, User } = require('../models');

const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// POST /api/pencas
const create = async (req, res) => {
  try {
    const { name, invite_code } = req.body;
    const { userId } = req.user;

    const code = invite_code || generateCode();
    const exists = await Penca.findOne({ where: { invite_code: code } });
    if (exists) return res.status(409).json({ error: 'Ese código ya existe. Elige otro.' });

    const penca = await Penca.create({ name, invite_code: code, created_by: userId });
    await PencaMembership.create({ user_id: userId, penca_id: penca.id, role: 'admin' });

    return res.status(201).json({ penca });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/pencas/:invite_code/info  (público — para mostrar nombre antes de registrarse)
const getByCode = async (req, res) => {
  try {
    const penca = await Penca.findOne({
      where: { invite_code: req.params.invite_code, status: 'active' },
      attributes: ['id', 'name', 'invite_code'],
    });
    if (!penca) return res.status(404).json({ error: 'Penca no encontrada' });
    return res.json({ penca });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/pencas/:id/regenerate-code  (admin)
const regenerateCode = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const penca = await Penca.findByPk(pencaId);
    if (!penca) return res.status(404).json({ error: 'Penca no encontrada' });

    let newCode;
    let collision = true;
    while (collision) {
      newCode = generateCode();
      collision = !!(await Penca.findOne({ where: { invite_code: newCode } }));
    }
    penca.invite_code = newCode;
    await penca.save();
    return res.json({ invite_code: penca.invite_code });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/pencas/:id/members  (admin)
const getMembers = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const members = await PencaMembership.findAll({
      where: { penca_id: pencaId },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
    });
    return res.json({ members });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/pencas/:id/members/:userId/status  (admin)
const updateMemberStatus = async (req, res) => {
  try {
    const { pencaId } = req.user;
    const { userId } = req.params;
    const { status } = req.body;

    const membership = await PencaMembership.findOne({ where: { user_id: userId, penca_id: pencaId } });
    if (!membership) return res.status(404).json({ error: 'Miembro no encontrado' });

    membership.status = status;
    await membership.save();
    return res.json({ membership });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/pencas/create-with-admin  (público — crea penca + usuario admin en un paso)
const createWithAdmin = async (req, res) => {
  try {
    const { penca_name, invite_code, nickname, cedula } = req.body;

    const code = (invite_code || '').trim().toUpperCase();
    if (!code || code.length < 4) return res.status(400).json({ error: 'El código debe tener al menos 4 caracteres' });
    if (!/^[A-Z0-9]+$/.test(code)) return res.status(400).json({ error: 'El código solo puede contener letras y números' });

    const exists = await Penca.findOne({ where: { invite_code: code } });
    if (exists) return res.status(409).json({ error: 'Ese código ya está en uso. Elegí otro.' });

    const cedula_hash = await bcrypt.hash(cedula, 12);
    const user = await User.create({ nickname, cedula_hash });
    const penca = await Penca.create({ name: penca_name, invite_code: code, created_by: user.id });
    await PencaMembership.create({ user_id: user.id, penca_id: penca.id, role: 'admin' });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, pencaId: penca.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return res.status(201).json({ token, nickname: user.nickname, penca: penca.name, role: 'admin', invite_code: penca.invite_code });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { create, createWithAdmin, getByCode, regenerateCode, getMembers, updateMemberStatus };
