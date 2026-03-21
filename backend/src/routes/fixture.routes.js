const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/fixture.controller');
const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');
const { validate } = require('../middlewares/validate');

const router = Router();
router.use(auth);

router.get('/tournament/:tournamentId', ctrl.list);

// FUNC-012: Ver calendario completo del torneo activo
router.get('/calendar', ctrl.getCalendar);

router.post('/tournament/:tournamentId', isAdmin, [
  body('number').isInt({ min: 1 }).withMessage('Número de fecha inválido'),
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  validate,
], ctrl.create);

module.exports = router;
