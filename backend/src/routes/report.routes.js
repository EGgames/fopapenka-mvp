const { Router } = require('express');
const ctrl = require('../controllers/report.controller');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = Router();
router.use(auth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.show);
router.post('/', upload.single('image'), ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
