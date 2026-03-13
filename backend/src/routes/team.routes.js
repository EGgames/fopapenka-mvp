const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/team.controller');
const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/isAdmin');
const { validate } = require('../middlewares/validate');

const router = Router();
router.use(auth);

router.get('/tournament/:tournamentId', ctrl.list);

router.post('/tournament/:tournamentId', isAdmin, [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('logo_url').optional().isURL().withMessage('URL de logo inválida'),
  validate,
], ctrl.create);

router.delete('/:id', isAdmin, ctrl.remove);

module.exports = router;
