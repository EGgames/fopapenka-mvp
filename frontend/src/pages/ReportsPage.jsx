import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';

export default function ReportsPage() {
  const { nickname, role } = useAuthStore(useShallow((s) => ({ nickname: s.nickname, role: s.role })));
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadReports = () => {
    setLoading(true);
    api.get('/reports')
      .then(({ data }) => setReports(data.reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('Título y contenido son obligatorios.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('content', form.content.trim());
      if (imageFile) formData.append('image', imageFile);

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ title: '', content: '' });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      loadReports();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al publicar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('No se pudo eliminar el reporte.');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📰 Auge Reportes</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
          >
            {showForm ? 'Cancelar' : '+ Nueva noticia'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 shadow-sm mb-6 space-y-3">
            <h3 className="font-semibold text-gray-700">Publicar noticia</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              type="text"
              placeholder="Título *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={200}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <textarea
              placeholder="Contenido *"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Imagen (opcional, máx. 5 MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file || null);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="mt-2 rounded-lg h-32 object-cover w-full" />
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">Cargando reportes...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay noticias publicadas todavía. ¡Sé el primero!</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{report.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Por <span className="font-semibold text-green-600">{report.User?.nickname ?? 'Anónimo'}</span>
                    {' · '}
                    {new Date(report.created_at).toLocaleDateString('es-UY', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.content}</p>
                  {(report.User?.nickname === nickname || role === 'admin') && (
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="mt-3 text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
