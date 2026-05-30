const { Router } = require('express');
const ctrl = require('../controllers/report.controller');
const { auth } = require('../middlewares/auth');

const router = Router();
router.use(auth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.show);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);

// Comentarios
router.post('/:id/comments', ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.removeComment);

module.exports = router;
