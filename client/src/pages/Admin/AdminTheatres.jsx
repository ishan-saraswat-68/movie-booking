import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const EMPTY_FORM = { name: '', address: '', city: '', state: '', pincode: '', phone: '', totalSeats: '', rows: '', cols: '' };

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTheatres(); }, []);

  const fetchTheatres = async () => {
    const res = await api.get('/theatres');
    setTheatres(res.data.theatres);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({ ...t, rows: t.seatLayout?.rows || '', cols: t.seatLayout?.cols || '' });
    setEditing(t._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        totalSeats: Number(form.totalSeats),
        seatLayout: { rows: Number(form.rows), cols: Number(form.cols), categories: [
          { name: 'Recliner', rows: ['A', 'B'], price: 500 },
          { name: 'Gold', rows: ['C', 'D', 'E'], price: 300 },
          { name: 'Silver', rows: ['F', 'G', 'H'], price: 180 },
        ]},
      };
      if (editing) { await api.put(`/theatres/${editing}`, payload); toast.success('Theatre updated'); }
      else { await api.post('/theatres', payload); toast.success('Theatre added'); }
      setShowModal(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this theatre?')) return;
    await api.delete(`/theatres/${id}`);
    toast.success('Theatre deleted');
    fetchTheatres();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Theatres</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FaPlus /> Add Theatre</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {theatres.map((t) => (
          <div key={t._id} className="card p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold text-lg">{t.name}</h3>
                <p className="text-muted text-sm flex items-center gap-1 mt-1"><FaMapMarkerAlt className="text-primary" />{t.city}, {t.state}</p>
                <p className="text-gray-400 text-sm mt-1">{t.address}</p>
                <p className="text-gray-500 text-xs mt-2">Total Seats: {t.totalSeats}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="text-yellow-400 hover:text-yellow-300 p-2"><FaEdit /></button>
                <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-400 p-2"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Theatre' : 'Add Theatre'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[['name','Theatre Name','text',true,'col-span-2'],['address','Address','text',true,'col-span-2'],['city','City','text',true,''],['state','State','text',true,''],['pincode','Pincode','text',true,''],['phone','Phone','tel',false,''],['totalSeats','Total Seats','number',true,''],['rows','Seat Rows','number',true,''],['cols','Seat Columns','number',true,'']].map(([key,label,type,req,span]) => (
                <div key={key} className={span}>
                  <label className="block text-sm text-muted mb-1">{label}</label>
                  <input type={type} required={req} className="input-field" value={form[key]||''} onChange={(e)=>setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div className="col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Update' : 'Add Theatre'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
