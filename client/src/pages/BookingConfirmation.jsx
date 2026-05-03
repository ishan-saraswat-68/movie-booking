import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import { FaCheckCircle, FaTicketAlt, FaHome } from 'react-icons/fa';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>;
  if (!booking) return <div className="text-center py-20 text-muted">Booking not found</div>;

  const { show, seats, totalAmount, bookingId: bId, createdAt } = booking;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      {/* Success Header */}
      <div className="text-center mb-8">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white">Booking Confirmed!</h1>
        <p className="text-muted mt-2">Your tickets have been booked successfully</p>
      </div>

      {/* Ticket Card */}
      <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Movie Banner */}
        <div className="relative h-32 overflow-hidden">
          <img src={show.movie.poster} alt={show.movie.title} className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 flex items-end p-4">
            <h2 className="text-white text-xl font-bold">{show.movie.title}</h2>
          </div>
        </div>

        {/* Ticket details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Theatre" value={show.theatre.name} />
            <Detail label="City" value={show.theatre.city} />
            <Detail label="Date" value={format(new Date(show.date.substring(0, 10) + 'T00:00:00'), 'dd MMM yyyy')} />
            <Detail label="Time" value={show.time} />
            <Detail label="Language" value={show.language} />
            <Detail label="Format" value={show.format} />
          </div>

          <div className="border-t border-dashed border-gray-600 pt-4">
            <Detail label="Seats" value={seats.join(', ')} />
            <Detail label="Booking ID" value={bId} mono />
            <Detail label="Booked On" value={format(new Date(createdAt), 'dd MMM yyyy, hh:mm a')} />
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex justify-between items-center">
            <span className="text-gray-300 font-semibold">Total Amount</span>
            <span className="text-primary text-2xl font-bold">₹{totalAmount}</span>
          </div>
        </div>

        {/* Dotted separator */}
        <div className="relative">
          <div className="absolute -left-4 w-8 h-8 bg-dark rounded-full" />
          <div className="absolute -right-4 w-8 h-8 bg-dark rounded-full" />
          <div className="border-t border-dashed border-gray-700 mx-4" />
        </div>

        {/* Barcode placeholder */}
        <div className="p-6 text-center">
          <FaTicketAlt className="text-5xl text-muted mx-auto mb-2" />
          <p className="text-muted text-xs">Show this at the counter</p>
          <p className="font-mono text-gray-500 text-sm mt-1">{bId}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Link to="/my-bookings" className="btn-outline flex-1 text-center">My Bookings</Link>
        <Link to="/" className="btn-primary flex-1 text-center flex items-center justify-center gap-2"><FaHome /> Home</Link>
      </div>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="mb-2">
      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
      <p className={`text-white text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
