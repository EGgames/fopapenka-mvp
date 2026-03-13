const { Router } = require('express');
const ctrl = require('../controllers/chat.controller');
const { auth } = require('../middlewares/auth');

const router = Router();
router.use(auth);

router.get('/', ctrl.history);

module.exports = router;
