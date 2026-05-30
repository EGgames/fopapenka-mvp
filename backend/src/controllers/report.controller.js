const reportService = require('../services/report.service');

const list = async (req, res, next) => {
  try {
    const reports = await reportService.getAll();
    res.json({ reports });
  } catch (err) {
    next(err);
  }
};

const show = async (req, res, next) => {
  try {
    const report = await reportService.getById(Number(req.params.id));
    res.json({ report });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // JWT guarda userId (no id)
    const userId = req.user.userId;
    const report = await reportService.create(userId, req.body);
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await reportService.remove(Number(req.params.id), req.user.userId, req.user.role);
    res.json({ message: 'Reporte eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, show, create, remove };
