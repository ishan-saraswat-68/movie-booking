import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FaStar, FaClock, FaCalendar, FaLanguage, FaTicketAlt, FaChevronLeft, FaPlay } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    fetchMovie();
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  }, [id]);

  useEffect(() => {
    if (selectedDate) fetchShows();
  }, [selectedDate, id]);

  const fetchMovie = async () => {
    try {
      const res = await api.get(`/movies/${id}`);
      setMovie(res.data.movie);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const res = await api.get('/shows', { params: { movie: id, date: selectedDate } });
      setShows(res.data.shows);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-dark">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-accent/20 rounded-full" />
      </div>
    </div>
  );
  if (!movie) return null;

  const showsByTheatre = shows.reduce((acc, show) => {
    const tId = show.theatre._id;
    if (!acc[tId]) acc[tId] = { theatre: show.theatre, shows: [] };
    acc[tId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="bg-dark min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative h-[500px] md:h-[600px] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 blur-sm"
          style={{ backgroundImage: `url(${movie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/90 to-dark/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full flex items-end pb-12">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-8 left-4 md:left-8 glass p-3 rounded-full text-white hover:text-accent hover:shadow-neon-cyan transition-all"
          >
            <FaChevronLeft />
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-end w-full">
            <div className="hidden md:block w-64 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 group">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre?.map((g) => (
                  <span key={g} className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{g}</span>
                ))}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tighter uppercase italic">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-6 text-muted font-bold text-sm mb-6">
                <span className="flex items-center gap-2 text-accent"><FaStar className="animate-pulse" /> {movie.rating}/10</span>
                <span className="flex items-center gap-2"><FaClock className="text-primary" /> {movie.duration} min</span>
                <span className="flex items-center gap-2"><FaCalendar className="text-primary" /> {format(new Date(movie.releaseDate), 'yyyy')}</span>
                <span className="flex items-center gap-2 uppercase tracking-tighter"><FaLanguage className="text-primary" /> {movie.language?.join(' • ')}</span>
              </div>
              
              <p className="text-light/80 text-lg leading-relaxed max-w-3xl font-medium mb-8">
                {movie.description}
              </p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <a href="#booking" className="btn-primary flex items-center gap-3 py-4 px-12 shadow-neon-purple text-lg">
                  <FaTicketAlt /> Book Now
                </a>
                {movie.trailer && (
                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-4 px-8 rounded-full border-2 border-accent/40 text-accent hover:bg-accent hover:text-dark font-bold text-lg transition-all duration-300 hover:shadow-neon-cyan group"
                  >
                    <FaPlay className="group-hover:scale-125 transition-transform" /> Watch Trailer
                  </a>
                )}
                {movie.director && (
                  <div className="glass px-6 py-2 rounded-full">
                    <span className="text-muted text-xs uppercase tracking-widest block">Directed By</span>
                    <span className="text-white font-bold">{movie.director}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div id="booking" className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Select Your Session</h2>
            <div className="h-1 w-20 bg-accent rounded-full mt-2" />
          </div>
          
          {/* Date Picker */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {dates.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center min-w-[80px] p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected ? 'border-accent bg-accent text-dark shadow-neon-cyan transform scale-105' : 'border-white/5 bg-white/5 text-muted hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1">{format(date, 'EEE')}</span>
                  <span className="text-2xl font-black">{format(date, 'd')}</span>
                  <span className="text-[10px] font-black uppercase">{format(date, 'MMM')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showtimes */}
        {Object.values(showsByTheatre).length === 0 ? (
          <div className="text-center py-24 glass rounded-[40px] border-dashed border-2 border-white/5">
            <p className="text-7xl mb-6">🌑</p>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Transmissions Found</h3>
            <p className="text-muted">There are no shows available for the selected date.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.values(showsByTheatre).map(({ theatre, shows: theatreShows }) => (
              <div key={theatre._id} className="glass p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors">{theatre.name}</h3>
                    <p className="text-muted font-medium flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                      {theatre.address}, {theatre.city}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black text-muted uppercase tracking-widest border border-white/5">IMAX</span>
                    <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-black text-muted uppercase tracking-widest border border-white/5">Dolby 7.1</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {theatreShows.map((show) => {
                    const availableSeats = show.totalSeats - show.bookedSeats.length;
                    const isFull = availableSeats === 0;
                    return (
                      <button
                        key={show._id}
                        disabled={isFull}
                        onClick={() => {
                          if (!user) { toast.error('Transmission requires authorization. Please log in.'); navigate('/login'); return; }
                          navigate(`/booking/${show._id}`);
                        }}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                          isFull
                            ? 'border-white/5 bg-white/5 opacity-30 cursor-not-allowed'
                            : 'border-white/5 bg-dark hover:border-accent hover:shadow-neon-cyan hover:-translate-y-1'
                        }`}
                      >
                        <span className="text-xl font-black text-white mb-1 group-hover:text-accent transition-colors">{show.time}</span>
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">{show.format}</span>
                        <div className={`mt-2 px-2 py-0.5 rounded text-[8px] font-black uppercase ${isFull ? 'bg-red-500/20 text-red-400' : 'bg-accent/10 text-accent'}`}>
                          {isFull ? 'Sold Out' : `${availableSeats} Left`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
