const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/tournament.controller');
const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');
const { validate } = require('../middlewares/validate');

const router = Router();
router.use(auth);

router.get('/', ctrl.list);

router.post('/', isAdmin, [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Año inválido'),
  body('continuity_mode').isIn(['accumulate', 'reset']).withMessage('Modo inválido'),
  validate,
], ctrl.create);

router.patch('/:id/finish', isAdmin, ctrl.finish);

module.exports = router;
