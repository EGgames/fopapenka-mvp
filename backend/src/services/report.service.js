const { Report, User, ReportComment, ReportCommentReaction } = require('../models');

const getAll = async () => {
  return Report.findAll({
    include: [{ model: User, attributes: ['id', 'nickname'] }],
    order: [['created_at', 'DESC']],
  });
};

const getById = async (id) => {
  const report = await Report.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'nickname'] },
      {
        model: ReportComment,
        where: { parent_id: null },
        required: false,
        include: [
          { model: User, attributes: ['id', 'nickname'] },
          { model: ReportCommentReaction, attributes: ['id', 'user_id', 'reaction'] },
          {
            model: ReportComment, as: 'Replies',
            separate: true,
            order: [['created_at', 'ASC']],
            include: [
              { model: User, attributes: ['id', 'nickname'] },
              { model: ReportCommentReaction, attributes: ['id', 'user_id', 'reaction'] },
            ],
          },
        ],
      },
    ],
    order: [[ReportComment, 'created_at', 'ASC']],
  });
  if (!report) {
    const err = new Error('Reporte no encontrado');
    err.status = 404;
    throw err;
  }
  return report;
};

const create = async (userId, { title, content, image_url }) => {
  if (!title?.trim()) {
    const err = new Error('El título es obligatorio');
    err.status = 400;
    throw err;
  }
  if (!content?.trim()) {
    const err = new Error('El contenido es obligatorio');
    err.status = 400;
    throw err;
  }
  return Report.create({ user_id: userId, title: title.trim(), content: content.trim(), image_url: image_url || null });
};

const remove = async (id, userId, role) => {
  const report = await getById(id);
  if (report.user_id !== userId && role !== 'admin') {
    const err = new Error('Sin permiso para eliminar este reporte');
    err.status = 403;
    throw err;
  }
  await report.destroy();
};

const addComment = async (reportId, userId, content, parentId = null) => {
  if (!content?.trim()) {
    const err = new Error('El comentario no puede estar vacío');
    err.status = 400;
    throw err;
  }
  if (content.trim().length > 500) {
    const err = new Error('El comentario no puede superar 500 caracteres');
    err.status = 400;
    throw err;
  }
  // Verificar que el reporte existe
  await getById(reportId);
  if (parentId) {
    const parent = await ReportComment.findByPk(parentId);
    if (!parent || Number(parent.report_id) !== Number(reportId)) {
      const err = new Error('Comentario padre no encontrado');
      err.status = 404;
      throw err;
    }
  }
  const comment = await ReportComment.create({
    report_id: reportId,
    user_id: userId,
    content: content.trim(),
    parent_id: parentId || null,
  });
  return ReportComment.findByPk(comment.id, {
    include: [
      { model: User, attributes: ['id', 'nickname'] },
      { model: ReportCommentReaction, attributes: ['id', 'user_id', 'reaction'] },
    ],
  });
};

const removeComment = async (commentId, userId, role) => {
  const comment = await ReportComment.findByPk(commentId);
  if (!comment) {
    const err = new Error('Comentario no encontrado');
    err.status = 404;
    throw err;
  }
  if (comment.user_id !== userId && role !== 'admin') {
    const err = new Error('Sin permiso para eliminar este comentario');
    err.status = 403;
    throw err;
  }
  await comment.destroy();
};

const toggleReaction = async (commentId, userId, reaction) => {
  if (!['like', 'dislike'].includes(reaction)) {
    const err = new Error('Reacción inválida');
    err.status = 400;
    throw err;
  }
  const comment = await ReportComment.findByPk(commentId);
  if (!comment) {
    const err = new Error('Comentario no encontrado');
    err.status = 404;
    throw err;
  }
  const existing = await ReportCommentReaction.findOne({
    where: { comment_id: commentId, user_id: userId },
  });
  if (existing) {
    if (existing.reaction === reaction) {
      await existing.destroy();
      return { action: 'removed', reaction };
    }
    existing.reaction = reaction;
    await existing.save();
    return { action: 'updated', reaction };
  }
  await ReportCommentReaction.create({ comment_id: commentId, user_id: userId, reaction });
  return { action: 'added', reaction };
};

module.exports = { getAll, getById, create, remove, addComment, removeComment, toggleReaction };
