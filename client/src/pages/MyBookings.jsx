import { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { FaTicketAlt, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled & refund initiated');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <FaTicketAlt className="text-6xl text-muted mx-auto mb-4" />
          <p className="text-muted text-xl">No bookings yet</p>
          <Link to="/" className="btn-primary mt-6 inline-block">Browse Movies</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <div key={booking._id} className={`card p-5 flex gap-4 ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
              <img
                src={booking.show.movie.poster}
                alt={booking.show.movie.title}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold text-lg">{booking.show.movie.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    booking.status === 'cancelled' ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-muted text-sm">{booking.show.theatre.name}, {booking.show.theatre.city}</p>
                <p className="text-gray-300 text-sm">
                  {format(new Date(booking.show.date.substring(0, 10) + 'T00:00:00'), 'EEE, dd MMM yyyy')} · {booking.show.time}
                </p>
                <p className="text-gray-400 text-sm mt-1">Seats: <span className="text-white">{booking.seats.join(', ')}</span></p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-primary font-bold text-lg">₹{booking.totalAmount}</span>
                    <span className="text-muted text-xs ml-2">#{booking.bookingId}</span>
                  </div>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm border border-red-800 hover:border-red-600 px-3 py-1 rounded-lg transition-colors"
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
