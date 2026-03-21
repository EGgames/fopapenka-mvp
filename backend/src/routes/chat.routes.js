const { Router } = require('express');
const ctrl = require('../controllers/chat.controller');
const { auth } = require('../middlewares/auth');

const router = Router();
router.use(auth);

router.get('/', ctrl.history);
router.post('/', ctrl.send);
router.put('/read', ctrl.markRead);
router.get('/unread', ctrl.unreadCount);

module.exports = router;
