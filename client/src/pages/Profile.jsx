import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user: authUser } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [user, setUser] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchBookingCount();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setForm({ name: res.data.user.name, phone: res.data.user.phone || '' });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookingCount = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookingCount(res.data.bookings.length);
    } catch {}
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      setUser(res.data.user);
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: form.name }));
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Avatar Header */}
      <div className="card p-8 text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-red-800 flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white shadow-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        <p className="text-muted mt-1">{user.email}</p>
        {user.role === 'admin' && (
          <span className="inline-block mt-2 bg-yellow-900 text-yellow-400 text-xs px-3 py-1 rounded-full font-semibold">
            Admin
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5 text-center">
          <FaTicketAlt className="text-primary text-3xl mx-auto mb-2" />
          <p className="text-3xl font-bold text-white">{bookingCount}</p>
          <p className="text-muted text-sm">Total Bookings</p>
        </div>
        <div className="card p-5 text-center">
          <FaUser className="text-blue-400 text-3xl mx-auto mb-2" />
          <p className="text-3xl font-bold text-white capitalize">{user.role}</p>
          <p className="text-muted text-sm">Account Type</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-primary hover:text-red-400 transition-colors text-sm">
              <FaEdit /> Edit
            </button>
          ) : (
            <button onClick={() => setEditing(false)} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
              <FaTimes /> Cancel
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center flex-shrink-0">
              <FaUser className="text-primary" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              ) : (
                <p className="text-white font-medium">{user.name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center flex-shrink-0">
              <FaEnvelope className="text-blue-400" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">Email Address</label>
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-muted text-xs mt-0.5">Email cannot be changed</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center flex-shrink-0">
              <FaPhone className="text-green-400" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted uppercase tracking-wide mb-1">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 99999 99999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              ) : (
                <p className="text-white font-medium">{user.phone || <span className="text-muted">Not provided</span>}</p>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-6 flex gap-4">
        <Link to="/my-bookings" className="btn-outline flex-1 text-center">View My Bookings</Link>
        {authUser?.role === 'admin' && (
          <Link to="/admin" className="btn-primary flex-1 text-center">Admin Panel</Link>
        )}
      </div>
    </div>
  );
}
