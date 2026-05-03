import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { format } from 'date-fns';
import { FaSearch, FaTicketAlt } from 'react-icons/fa';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let data = bookings;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (b) =>
          b.bookingId?.toLowerCase().includes(q) ||
          b.user?.name?.toLowerCase().includes(q) ||
          b.user?.email?.toLowerCase().includes(q) ||
          b.show?.movie?.title?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') data = data.filter((b) => b.status === statusFilter);
    setFiltered(data);
  }, [bookings, search, statusFilter]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.bookings);
      setFiltered(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">All Bookings</h1>
      <p className="text-muted mb-8">Monitor and manage all ticket bookings</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-blue-400' },
          { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'text-green-400' },
          { label: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: 'text-red-400' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-yellow-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-muted text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by booking ID, user, or movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <FaTicketAlt className="text-5xl mx-auto mb-4" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-dark">
                  <th className="py-4 px-4 text-muted font-medium">Booking ID</th>
                  <th className="py-4 px-4 text-muted font-medium">User</th>
                  <th className="py-4 px-4 text-muted font-medium">Movie</th>
                  <th className="py-4 px-4 text-muted font-medium">Theatre</th>
                  <th className="py-4 px-4 text-muted font-medium">Show</th>
                  <th className="py-4 px-4 text-muted font-medium">Seats</th>
                  <th className="py-4 px-4 text-muted font-medium">Amount</th>
                  <th className="py-4 px-4 text-muted font-medium">Status</th>
                  <th className="py-4 px-4 text-muted font-medium">Booked On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">{booking.bookingId?.slice(0, 14)}…</td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{booking.user?.name}</p>
                      <p className="text-muted text-xs">{booking.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-white">{booking.show?.movie?.title}</td>
                    <td className="py-3 px-4 text-gray-300">{booking.show?.theatre?.name}</td>
                    <td className="py-3 px-4 text-gray-300 text-xs">
                      {booking.show?.date && format(new Date(booking.show.date), 'dd MMM')} · {booking.show?.time}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {booking.seats?.map((s) => (
                          <span key={s} className="text-xs bg-dark px-1.5 py-0.5 rounded text-gray-400 border border-gray-700">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-primary font-semibold">₹{booking.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">
                      {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-800 text-muted text-sm">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  );
}
