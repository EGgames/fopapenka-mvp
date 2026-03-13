const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/match.controller');

const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');
const { validate } = require('../middlewares/validate');

const router = Router();
router.use(auth);

router.post('/fixture/:fixtureId', isAdmin, [
  body('home_team_id').isInt().withMessage('Equipo local requerido'),
  body('away_team_id').isInt().withMessage('Equipo visitante requerido'),
  body('match_date').optional().isISO8601().withMessage('Fecha inválida'),
  validate,
], ctrl.create);

router.put('/:id/result', isAdmin, [
  body('home_score').isInt({ min: 0 }).withMessage('Goles local inválidos'),
  body('away_score').isInt({ min: 0 }).withMessage('Goles visitante inválidos'),
  validate,
], ctrl.setResult);

router.delete('/:id/result', isAdmin, ctrl.resetResult);

module.exports = router;
