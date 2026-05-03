import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

const EMPTY_FORM = { movie: '', theatre: '', date: '', time: '', language: 'Hindi', format: '2D', totalSeats: '80', price: { recliner: 500, gold: 300, silver: 180 } };

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [s, m, t] = await Promise.all([api.get('/shows'), api.get('/movies'), api.get('/theatres')]);
    setShows(s.data.shows);
    setMovies(m.data.movies);
    setTheatres(t.data.theatres);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/shows', { ...form, totalSeats: Number(form.totalSeats) });
      toast.success('Show added');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this show?')) return;
    await api.delete(`/shows/${id}`);
    toast.success('Show deleted');
    fetchAll();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Shows</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} className="btn-primary flex items-center gap-2"><FaPlus /> Schedule Show</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-700 text-muted">
              <th className="py-3 px-4">Movie</th>
              <th className="py-3 px-4">Theatre</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Seats</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr key={show._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4 text-white font-medium">{show.movie?.title}</td>
                <td className="py-3 px-4 text-gray-300">{show.theatre?.name}</td>
                <td className="py-3 px-4 text-gray-300">{format(new Date(show.date.substring(0, 10) + 'T00:00:00'), 'dd MMM yyyy')}</td>
                <td className="py-3 px-4 text-gray-300">{show.time}</td>
                <td className="py-3 px-4"><span className="bg-dark px-2 py-0.5 rounded text-primary text-xs">{show.format}</span></td>
                <td className="py-3 px-4 text-gray-300">{show.totalSeats - show.bookedSeats.length}/{show.totalSeats}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(show._id)} className="text-red-500 hover:text-red-400"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shows.length === 0 && <p className="text-center text-muted py-10">No shows scheduled yet</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Schedule Show</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Movie</label>
                <select required className="input-field" value={form.movie} onChange={(e) => setForm({ ...form, movie: e.target.value })}>
                  <option value="">Select Movie</option>
                  {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Theatre</label>
                <select required className="input-field" value={form.theatre} onChange={(e) => setForm({ ...form, theatre: e.target.value })}>
                  <option value="">Select Theatre</option>
                  {theatres.map((t) => <option key={t._id} value={t._id}>{t.name} - {t.city}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Date</label>
                  <input type="date" required className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Time</label>
                  <input type="text" required placeholder="10:30 AM" className="input-field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Language</label>
                  <select className="input-field" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    {['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Format</label>
                  <select className="input-field" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    {['2D', '3D', 'IMAX', '4DX'].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Total Seats</label>
                  <input type="number" required className="input-field" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['recliner', 'gold', 'silver'].map((cat) => (
                  <div key={cat}>
                    <label className="block text-sm text-muted mb-1 capitalize">{cat} Price (₹)</label>
                    <input type="number" className="input-field" value={form.price[cat]} onChange={(e) => setForm({ ...form, price: { ...form.price, [cat]: Number(e.target.value) } })} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Saving...' : 'Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
