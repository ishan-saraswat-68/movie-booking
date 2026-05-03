import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const EMPTY_FORM = {
  title: '', description: '', genre: '', language: '', duration: '', releaseDate: '',
  poster: '', trailer: '', director: '', rating: '',
};

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async () => {
    const res = await api.get('/movies');
    setMovies(res.data.movies);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (movie) => {
    setForm({
      ...movie,
      genre: movie.genre?.join(', '),
      language: movie.language?.join(', '),
      releaseDate: movie.releaseDate?.split('T')[0],
    });
    setEditing(movie._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        genre: form.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: form.language.split(',').map((s) => s.trim()).filter(Boolean),
        duration: Number(form.duration),
        rating: Number(form.rating) || 0,
      };
      if (editing) {
        await api.put(`/movies/${editing}`, payload);
        toast.success('Movie updated');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie added');
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      toast.success('Movie deleted');
      fetchMovies();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Movies</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FaPlus /> Add Movie</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {movies.map((movie) => (
          <div key={movie._id} className="card group relative">
            <img src={movie.poster} alt={movie.title} className="w-full h-56 object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400'; }} />
            <div className="p-3">
              <p className="text-white text-sm font-semibold truncate">{movie.title}</p>
              <p className="text-muted text-xs">{movie.duration} min</p>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button onClick={() => openEdit(movie)} className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-500"><FaEdit /></button>
              <button onClick={() => handleDelete(movie._id)} className="bg-red-700 text-white p-2 rounded-lg hover:bg-red-600"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Movie' : 'Add Movie'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['title', 'Title', 'text', true],
                ['director', 'Director', 'text', false],
                ['duration', 'Duration (min)', 'number', true],
                ['releaseDate', 'Release Date', 'date', true],
                ['genre', 'Genre (comma separated)', 'text', true],
                ['language', 'Language (comma separated)', 'text', true],
                ['rating', 'Rating (0-10)', 'number', false],
                ['poster', 'Poster URL', 'url', true],
                ['trailer', 'Trailer URL', 'url', false],
              ].map(([key, label, type, required]) => (
                <div key={key} className={key === 'poster' || key === 'trailer' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm text-muted mb-1">{label}</label>
                  <input type={type} required={required} className="input-field" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm text-muted mb-1">Description</label>
                <textarea required rows={3} className="input-field resize-none" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Update' : 'Add Movie'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
