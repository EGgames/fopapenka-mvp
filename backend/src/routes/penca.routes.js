const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/penca.controller');
const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');
const { validate } = require('../middlewares/validate');

const router = Router();

// Público — saber el nombre de la penca antes de registrarse
router.get('/:invite_code/info', ctrl.getByCode);

// Público — crear penca + usuario admin en un paso
router.post('/create-with-admin', [
  body('penca_name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre de penca requerido (2-100 caracteres)'),
  body('invite_code').trim().isLength({ min: 4, max: 20 }).withMessage('Código debe tener 4-20 caracteres'),
  body('nickname').trim().isLength({ min: 2, max: 30 }).withMessage('Apodo requerido (2-30 caracteres)'),
  body('cedula').trim().isLength({ min: 6, max: 20 }).withMessage('Cédula requerida'),
  validate,
], ctrl.createWithAdmin);

// Requiere auth
router.use(auth);

router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre de penca requerido'),
  body('invite_code').optional().trim().isAlphanumeric().isLength({ min: 4, max: 20 }).withMessage('Código inválido'),
  validate,
], ctrl.create);

router.post('/regenerate-code', isAdmin, ctrl.regenerateCode);

router.get('/members', isAdmin, ctrl.getMembers);

router.patch('/members/:userId/status', isAdmin, [
  body('status').isIn(['active', 'inactive']).withMessage('Estado inválido'),
  validate,
], ctrl.updateMemberStatus);

module.exports = router;
