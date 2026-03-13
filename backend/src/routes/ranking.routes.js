const { Router } = require('express');
const ctrl = require('../controllers/ranking.controller');
const { auth } = require('../middlewares/auth');

const router = Router();
router.use(auth);

router.get('/tournament/:tournamentId', ctrl.tournament);
router.get('/accumulated', ctrl.accumulated);

module.exports = router;
