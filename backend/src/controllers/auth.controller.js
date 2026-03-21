const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Penca, PencaMembership } = require('../models');

const SALT_ROUNDS = 12;

const signToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || '7d'
    : process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { invite_code, nickname, cedula } = req.body;

    const penca = await Penca.findOne({ where: { invite_code, status: 'active' } });
    if (!penca) return res.status(404).json({ error: 'Código de penca inválido o inactivo' });

    // Verificar que el nickname no esté tomado en esta penca
    const existing = await User.findAll({
      where: { nickname },
      include: [{ model: PencaMembership, where: { penca_id: penca.id }, required: true }],
    });
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ese apodo ya está en uso en esta penca' });
    }

    const cedula_hash = await bcrypt.hash(cedula, SALT_ROUNDS);
    const user = await User.create({ nickname, cedula_hash });

    await PencaMembership.create({ user_id: user.id, penca_id: penca.id, role: 'player' });

    const token = signToken({ userId: user.id, pencaId: penca.id, role: 'player' });
    return res.status(201).json({ token, nickname: user.nickname, penca: penca.name });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { invite_code, nickname, cedula, rememberMe } = req.body;

    const penca = await Penca.findOne({ where: { invite_code, status: 'active' } });
    if (!penca) return res.status(404).json({ error: 'Código de penca inválido o inactivo' });

    const users = await User.findAll({
      where: { nickname },
      include: [{ model: PencaMembership, where: { penca_id: penca.id, status: 'active' }, required: true }],
    });
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const user = users[0];

    const match = await bcrypt.compare(cedula, user.cedula_hash);
    if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const membership = user.PencaMemberships[0];
    const token = signToken({ userId: user.id, pencaId: penca.id, role: membership.role }, rememberMe);
    return res.json({ token, nickname: user.nickname, penca: penca.name, role: membership.role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const { userId, pencaId, role } = req.user;
    const user = await User.findByPk(userId, { attributes: ['id', 'nickname'] });
    const penca = await Penca.findByPk(pencaId, { attributes: ['id', 'name', 'invite_code'] });
    return res.json({ user, penca, role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me/pencas — FUNC-006: Ver mis pencas
const getMyPencas = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const memberships = await PencaMembership.findAll({
      where: { user_id: userId, status: 'active' },
      include: [
        { 
          model: Penca, 
          attributes: ['id', 'name', 'invite_code', 'created_at'],
          where: { status: 'active' },
          required: true
        }
      ],
      order: [['updated_at', 'DESC']], // Ordenar por último acceso
    });

    const pencas = memberships.map(m => ({
      id: m.Penca.id,
      name: m.Penca.name,
      invite_code: m.Penca.invite_code,
      role: m.role,
      joined_at: m.created_at,
      last_access: m.updated_at,
    }));

    return res.json({ pencas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/logout — FUNC-007: Cerrar sesión
// Nota: Con JWT stateless, el logout es principalmente del lado del cliente
// Este endpoint es opcional para tracking/auditoría
const logout = async (req, res) => {
  try {
    const { userId, pencaId } = req.user;
    
    // Opcional: Registrar logout en logs de auditoría
    // await AuditLog.create({ user_id: userId, penca_id: pencaId, action: 'logout' });
    
    return res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, me, getMyPencas, logout };
