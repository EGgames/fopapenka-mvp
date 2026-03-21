const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, me, getMyPencas, logout } = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = Router();

router.post('/register', [
  body('invite_code').notEmpty().withMessage('Código de penca requerido'),
  body('nickname').trim().isLength({ min: 2, max: 30 }).withMessage('Apodo entre 2 y 30 caracteres'),
  body('cedula').isNumeric().isLength({ min: 6, max: 15 }).withMessage('Cédula inválida (solo números, 6-15 dígitos)'),
  validate,
], register);

router.post('/login', [
  body('invite_code').notEmpty().withMessage('Código de penca requerido'),
  body('nickname').notEmpty().withMessage('Apodo requerido'),
  body('cedula').notEmpty().withMessage('Cédula requerida'),
  validate,
], login);

router.get('/me', auth, me);

// FUNC-006: Ver mis pencas
router.get('/me/pencas', auth, getMyPencas);

// FUNC-007: Cerrar sesión
router.post('/logout', auth, logout);

module.exports = router;
