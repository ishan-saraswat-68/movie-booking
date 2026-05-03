import { FaFilm, FaGithub, FaTwitter, FaInstagram, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/5 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-3 group mb-6">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-neon-purple">
              <FaFilm className="text-white text-xl" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white neon-text-purple uppercase italic">CINEVERSE</span>
          </Link>
          <p className="text-muted text-lg font-medium max-w-sm leading-relaxed">
            The world's most immersive digital movie hub. Step into the future of entertainment with Cineverse.
          </p>
        </div>

        <div>
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-6">Navigation</h4>
          <ul className="space-y-4 text-muted text-sm font-bold uppercase tracking-widest">
            <li><Link to="/" className="hover:text-accent hover:shadow-neon-cyan transition-all">Hub Home</Link></li>
            <li><Link to="/my-bookings" className="hover:text-primary hover:shadow-neon-purple transition-all">Transmission Log</Link></li>
            <li><a href="#" className="hover:text-white transition-all">Support Center</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-6">Connect</h4>
          <div className="flex gap-5 text-muted text-2xl">
            <a href="#" className="hover:text-accent transition-all hover:scale-125"><FaTwitter /></a>
            <a href="#" className="hover:text-primary transition-all hover:scale-125"><FaInstagram /></a>
            <a href="#" className="hover:text-white transition-all hover:scale-125"><FaGithub /></a>
            <a href="#" className="hover:text-accent transition-all hover:scale-125"><FaGlobe /></a>
          </div>
          <p className="mt-6 text-[10px] text-muted font-black uppercase tracking-[0.3em]">Global Network Active</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 gap-4">
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} CINEVERSE CORE. All Protocols Reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em] hover:text-white cursor-pointer">Privacy Cipher</span>
            <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em] hover:text-white cursor-pointer">Service Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
