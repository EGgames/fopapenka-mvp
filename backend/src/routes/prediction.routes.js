const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/prediction.controller');
const { auth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const router = Router();
router.use(auth);

router.post('/', [
  body('match_id').isInt().withMessage('Partido requerido'),
  body('predicted_home').isInt({ min: 0 }).withMessage('Goles local inválidos'),
  body('predicted_away').isInt({ min: 0 }).withMessage('Goles visitante inválidos'),
  validate,
], ctrl.upsert);

// FUNC-026a: Guardar múltiples pronósticos a la vez
router.post('/batch', [
  body('predictions').isArray({ min: 1 }).withMessage('Se requiere array de pronósticos'),
  validate,
], ctrl.batchUpsert);

router.get('/mine', ctrl.mine);

router.put('/match/:matchId', [
  body('predicted_home').isInt({ min: 0 }).withMessage('Goles local inválidos'),
  body('predicted_away').isInt({ min: 0 }).withMessage('Goles visitante inválidos'),
  validate,
], ctrl.update);

router.get('/match/:matchId', ctrl.byMatch);

module.exports = router;
