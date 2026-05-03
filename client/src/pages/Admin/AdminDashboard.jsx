import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaTicketAlt, FaChartBar } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: 0, theatres: 0, shows: 0, bookings: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [movies, theatres, shows, bookings] = await Promise.all([
          api.get('/movies'),
          api.get('/theatres'),
          api.get('/shows'),
          api.get('/bookings'),
        ]);
        const confirmedBookings = bookings.data.bookings.filter((b) => b.status === 'confirmed');
        const revenue = confirmedBookings.reduce((s, b) => s + b.totalAmount, 0);
        setStats({
          movies: movies.data.count,
          theatres: theatres.data.theatres.length,
          shows: shows.data.shows.length,
          bookings: bookings.data.bookings.length,
          revenue,
        });
        setRecentBookings(bookings.data.bookings.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Movies', value: stats.movies, icon: FaFilm, color: 'text-red-400', bg: 'bg-red-900/20', link: '/admin/movies' },
    { label: 'Theatres', value: stats.theatres, icon: FaTheaterMasks, color: 'text-yellow-400', bg: 'bg-yellow-900/20', link: '/admin/theatres' },
    { label: 'Shows', value: stats.shows, icon: FaCalendarAlt, color: 'text-green-400', bg: 'bg-green-900/20', link: '/admin/shows' },
    { label: 'Bookings', value: stats.bookings, icon: FaTicketAlt, color: 'text-blue-400', bg: 'bg-blue-900/20', link: '/admin/bookings' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: FaChartBar, color: 'text-purple-400', bg: 'bg-purple-900/20', link: '/admin/bookings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted mt-1">Manage your movie booking platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link} className={`card p-5 border border-transparent hover:border-gray-600 transition-all group`}>
            <div className={`inline-flex p-3 rounded-xl ${bg} mb-3`}>
              <Icon className={`text-2xl ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? '…' : value}</p>
            <p className="text-muted text-sm mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: '+ Add Movie', link: '/admin/movies', color: 'text-red-400 border-red-800 hover:bg-red-900/30' },
              { label: '+ Add Theatre', link: '/admin/theatres', color: 'text-yellow-400 border-yellow-800 hover:bg-yellow-900/30' },
              { label: '+ Schedule Show', link: '/admin/shows', color: 'text-green-400 border-green-800 hover:bg-green-900/30' },
              { label: '📋 View All Bookings', link: '/admin/bookings', color: 'text-blue-400 border-blue-800 hover:bg-blue-900/30' },
            ].map(({ label, link, color }) => (
              <Link key={label} to={link} className={`block border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${color}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-primary text-sm hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-12 bg-dark rounded-lg animate-pulse"/>)}</div>
          ) : recentBookings.length === 0 ? (
            <p className="text-muted text-sm">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between bg-dark rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{b.user?.name}</p>
                    <p className="text-muted text-xs">{b.show?.movie?.title} · {b.seats?.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-semibold text-sm">₹{b.totalAmount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
