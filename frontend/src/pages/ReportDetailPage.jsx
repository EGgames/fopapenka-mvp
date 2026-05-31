import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';

const formatDate = (d) => {
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('es-UY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nickname, role, userId } = useAuthStore(useShallow((s) => ({ nickname: s.nickname, role: s.role, userId: s.userId })));

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadReport = () => {
    setLoading(true);
    api.get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(() => navigate('/reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/reports/${id}/comments`, { content: commentText.trim() });
      setReport((prev) => ({
        ...prev,
        ReportComments: [...(prev.ReportComments || []), data.comment],
      }));
      setCommentText('');
    } catch {
      alert('Error al comentar.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar comentario?')) return;
    try {
      await api.delete(`/reports/${id}/comments/${commentId}`);
      setReport((prev) => ({
        ...prev,
        ReportComments: prev.ReportComments
          .filter((c) => c.id !== commentId)
          .map((c) => ({ ...c, Replies: (c.Replies ?? []).filter((r) => r.id !== commentId) })),
      }));
    } catch {
      alert('No se pudo eliminar el comentario.');
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const { data } = await api.post(`/reports/${id}/comments`, { content: replyText.trim(), parentId });
      setReport((prev) => ({
        ...prev,
        ReportComments: prev.ReportComments.map((c) => {
          if (c.id !== parentId) return c;
          return { ...c, Replies: [...(c.Replies ?? []), data.comment] };
        }),
      }));
      setReplyText('');
      setReplyingTo(null);
    } catch {
      alert('Error al responder.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    try {
      await api.delete(`/reports/${id}`);
      navigate('/reports');
    } catch {
      alert('No se pudo eliminar el reporte.');
    }
  };

  const handleReact = async (commentId, reaction) => {
    try {
      await api.post(`/reports/${id}/comments/${commentId}/react`, { reaction });
      setReport((prev) => ({
        ...prev,
        ReportComments: prev.ReportComments.map((c) => {
          if (c.id !== commentId) return c;
          const reactions = c.ReportCommentReactions ?? [];
          const existing = reactions.find((r) => r.user_id === userId);
          let updated;
          if (!existing) {
            updated = [...reactions, { user_id: userId, reaction }];
          } else if (existing.reaction === reaction) {
            updated = reactions.filter((r) => r.user_id !== userId);
          } else {
            updated = reactions.map((r) => r.user_id === userId ? { ...r, reaction } : r);
          }
          return { ...c, ReportCommentReactions: updated };
        }),
      }));
    } catch {
      alert('No se pudo guardar la reacción.');
    }
  };

  if (loading) return (
    <Layout>
      <p className="text-center text-gray-400 py-16">Cargando...</p>
    </Layout>
  );

  if (!report) return null;

  const isAuthor = report.User?.nickname === nickname;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5 transition"
        >
          ← Volver a Auge Reportes
        </button>

        {/* Tarjeta principal estilo Facebook */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-4">
          {/* Header del post */}
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg select-none">
              {(report.User?.nickname?.[0] ?? '?').toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{report.User?.nickname ?? 'Anónimo'}</p>
              <p className="text-xs text-gray-400">{formatDate(report.createdAt)}</p>
            </div>
            {(isAuthor || role === 'admin') && (
              <button
                onClick={handleDeleteReport}
                className="text-xs text-red-400 hover:text-red-600 transition"
              >
                Eliminar
              </button>
            )}
          </div>

          {/* Título */}
          <div className="px-4 pt-3">
            <h2 className="text-xl font-bold text-gray-800">{report.title}</h2>
          </div>

          {/* Imagen */}
          {report.image_url && (
            <img
              src={report.image_url}
              alt={report.title}
              className="w-full max-h-96 object-cover mt-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Contenido */}
          <div className="px-4 py-4">
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{report.content}</p>
          </div>

          {/* Contador de comentarios */}
          <div className="px-4 pb-2 border-t pt-2">
            <p className="text-xs text-gray-400">
              💬 {report.ReportComments?.length ?? 0} comentario{report.ReportComments?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Sección comentarios */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {/* Lista de comentarios */}
          <div className="divide-y">
            {(report.ReportComments?.length ?? 0) === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Sé el primero en comentar</p>
            ) : (
              report.ReportComments.map((c) => {
                const reactions = c.ReportCommentReactions ?? [];
                const likes = reactions.filter((r) => r.reaction === 'like').length;
                const dislikes = reactions.filter((r) => r.reaction === 'dislike').length;
                const myReaction = reactions.find((r) => r.user_id === userId)?.reaction ?? null;
                return (
                  <div key={c.id} className="px-4 py-3">
                    {/* Comentario principal */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0 select-none">
                        {(c.User?.nickname?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">
                          {c.User?.nickname ?? 'Anónimo'}
                          <span className="font-normal text-gray-400 ml-2">{formatDate(c.createdAt)}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-0.5 mb-1.5">{c.content}</p>
                        {/* Reacciones + Responder */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReact(c.id, 'like')}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${myReaction === 'like' ? 'bg-blue-100 border-blue-400 text-blue-600 font-semibold' : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}
                          >
                            👍 {likes > 0 && <span>{likes}</span>}
                          </button>
                          <button
                            onClick={() => handleReact(c.id, 'dislike')}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${myReaction === 'dislike' ? 'bg-red-100 border-red-400 text-red-600 font-semibold' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'}`}
                          >
                            👎 {dislikes > 0 && <span>{dislikes}</span>}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
                            className="text-xs text-gray-400 hover:text-green-500 transition"
                          >
                            💬 Responder
                          </button>
                        </div>
                        {/* Formulario de respuesta inline */}
                        {replyingTo === c.id && (
                          <form onSubmit={(e) => handleReply(e, c.id)} className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Responder a ${c.User?.nickname ?? 'Anónimo'}...`}
                              maxLength={500}
                              autoFocus
                              className="flex-1 bg-white border rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                              type="submit"
                              disabled={sendingReply || !replyText.trim()}
                              className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition disabled:opacity-40"
                            >
                              {sendingReply ? '...' : 'Enviar'}
                            </button>
                          </form>
                        )}
                      </div>
                      {(c.User?.nickname === nickname || role === 'admin') && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-300 hover:text-red-500 transition self-start"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Respuestas anidadas */}
                    {(c.Replies ?? []).length > 0 && (
                      <div className="ml-11 mt-2 space-y-2 border-l-2 border-gray-100 pl-3">
                        {c.Replies.map((reply) => {
                          const rReactions = reply.ReportCommentReactions ?? [];
                          const rLikes = rReactions.filter((r) => r.reaction === 'like').length;
                          const rDislikes = rReactions.filter((r) => r.reaction === 'dislike').length;
                          const rMyReaction = rReactions.find((r) => r.user_id === userId)?.reaction ?? null;
                          return (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0 select-none">
                                {(reply.User?.nickname?.[0] ?? '?').toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-800">
                                  {reply.User?.nickname ?? 'Anónimo'}
                                  <span className="font-normal text-gray-400 ml-2">{formatDate(reply.createdAt)}</span>
                                </p>
                                <p className="text-xs text-gray-700 mt-0.5 mb-1">{reply.content}</p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleReact(reply.id, 'like')}
                                    className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border transition ${rMyReaction === 'like' ? 'bg-blue-100 border-blue-400 text-blue-600 font-semibold' : 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500'}`}
                                  >
                                    👍 {rLikes > 0 && <span>{rLikes}</span>}
                                  </button>
                                  <button
                                    onClick={() => handleReact(reply.id, 'dislike')}
                                    className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border transition ${rMyReaction === 'dislike' ? 'bg-red-100 border-red-400 text-red-600 font-semibold' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'}`}
                                  >
                                    👎 {rDislikes > 0 && <span>{rDislikes}</span>}
                                  </button>
                                </div>
                              </div>
                              {(reply.User?.nickname === nickname || role === 'admin') && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-xs text-red-300 hover:text-red-500 transition self-start"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Input nuevo comentario */}
          <form onSubmit={handleComment} className="flex gap-2 p-3 border-t bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none">
              {(nickname?.[0] ?? '?').toUpperCase()}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={500}
              className="flex-1 bg-white border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={sending || !commentText.trim()}
              className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40"
            >
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
