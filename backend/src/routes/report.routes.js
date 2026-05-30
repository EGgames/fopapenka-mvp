const { Router } = require('express');
const ctrl = require('../controllers/report.controller');
const { auth } = require('../middlewares/auth');

const router = Router();
router.use(auth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.show);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
