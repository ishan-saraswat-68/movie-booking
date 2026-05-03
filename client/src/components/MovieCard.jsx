import { Link } from 'react-router-dom';
import { FaStar, FaClock } from 'react-icons/fa';

export default function MovieCard({ movie }) {
  return (
    <Link 
      to={`/movies/${movie._id}`} 
      className="group block relative rounded-2xl overflow-hidden bg-card border border-white/5 hover:border-accent/50 hover:shadow-neon-cyan hover:-translate-y-2 transition-all duration-500"
    >
      <div className="relative overflow-hidden aspect-[2/3]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-60" />
        
        {movie.rating > 0 && (
          <div className="absolute top-3 right-3 glass text-accent text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <FaStar className="animate-pulse" /> {movie.rating.toFixed(1)}
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
           <span className="btn-primary w-full block text-center text-sm py-2 px-0 shadow-2xl">Quick Book</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-white truncate text-xl group-hover:text-accent transition-colors duration-300">{movie.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-muted text-sm font-medium">
          <span className="flex items-center gap-1.5"><FaClock className="text-primary" /> {movie.duration}m</span>
          <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-white/5">{movie.genre?.[0]}</span>
        </div>
        
        <div className="flex gap-2 mt-3 overflow-hidden">
          {movie.language?.slice(0, 2).map((lang) => (
            <span key={lang} className="text-[10px] bg-dark text-muted px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-tighter">{lang}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
