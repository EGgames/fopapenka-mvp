const reportService = require('../services/report.service');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'auge-reportes', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

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
    let image_url = req.body.image_url || null;

    if (req.file) {
      image_url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    const report = await reportService.create(userId, { ...req.body, image_url });
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
