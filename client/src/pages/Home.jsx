import { useState, useEffect } from 'react';
import api from '../utils/api';
import MovieCard from '../components/MovieCard';
import { FaPlay, FaTicketAlt } from 'react-icons/fa';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('');

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Romance', 'Sci-Fi', 'Adventure'];

  useEffect(() => {
    fetchMovies();
  }, [genre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (genre) params.genre = genre;
      const res = await api.get('/movies', { params });
      setMovies(res.data.movies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden flex items-center mb-16">
        {/* Cinematic Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600" 
            alt="Hero Background" 
            className="w-full h-full object-cover brightness-[0.4] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
            <span className="text-accent font-black tracking-[0.4em] uppercase text-xs mb-4 block animate-glow">Exclusive Premiere</span>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] neon-text-purple">
              THE FUTURE <br /> OF CINEMA
            </h1>
            <p className="text-muted text-lg mb-8 max-w-lg leading-relaxed font-medium">
              Experience the next generation of storytelling with Cineverse. Immersive, futuristic, and unforgettable.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary group flex items-center gap-3 py-4 px-10">
                <FaTicketAlt className="group-hover:rotate-12 transition-transform" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Genre Filter */}
        <div className="flex items-center gap-6 mb-12">
          <h3 className="text-muted font-bold uppercase tracking-widest text-xs border-r border-white/10 pr-6">Categories</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
            <button
              onClick={() => setGenre('')}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                genre === '' ? 'bg-accent border-accent text-dark shadow-neon-cyan' : 'bg-transparent border-white/5 text-muted hover:border-white/20 hover:text-white'
              }`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g === genre ? '' : g)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                  genre === g ? 'bg-primary border-primary text-white shadow-neon-purple' : 'bg-transparent border-white/5 text-muted hover:border-white/20 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight uppercase italic tracking-tighter">
              {genre ? `${genre} Collection` : 'Now Trending'}
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-accent rounded-full mt-2" />
          </div>
          <span className="text-muted font-bold text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5">
            {movies.length} Results
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-white/5 animate-pulse">
                <div className="aspect-[2/3] bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-32 glass rounded-3xl border-dashed border-2 border-white/5">
            <p className="text-8xl mb-6 grayscale">🎬</p>
            <h3 className="text-2xl font-black text-white mb-2">NO FILMS IN THIS HUB</h3>
            <p className="text-muted">Try switching to a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}
          </div>
        )}
      </div>
    </div>
  );
}
