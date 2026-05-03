import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { FaFilm, FaUser, FaBars, FaTimes, FaChevronDown, FaSearch } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <FaFilm className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white neon-text-purple">CINEVERSE</span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search movies..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none focus:border-accent/50 focus:shadow-neon-cyan transition-all"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted hover:text-white transition-colors font-medium">Movies</Link>
            {user && <Link to="/my-bookings" className="text-muted hover:text-white transition-colors font-medium">My Bookings</Link>}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-accent hover:neon-text-cyan font-bold transition-all">Admin Panel</Link>
            )}
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 text-light hover:border-accent/50 px-3 py-2 rounded-full transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate font-medium">{user.name}</span>
                  <FaChevronDown className={`text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in slide-in-from-top-2">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-4 text-muted hover:bg-white/10 hover:text-white transition-colors">
                      <FaUser className="text-primary" /> Profile Settings
                    </Link>
                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-4 text-muted hover:bg-white/10 hover:text-white transition-colors">
                      <FaFilm className="text-accent" /> My Tickets
                    </Link>
                    <div className="border-t border-white/10" />
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-muted hover:text-white transition-colors font-semibold self-center">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-6">Join Cineverse</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white text-xl p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-muted hover:text-white font-medium py-2">Movies</Link>
          {user && <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="text-muted hover:text-white font-medium py-2">My Bookings</Link>}
          {user && <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-muted hover:text-white font-medium py-2">Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-accent font-bold py-2">Admin Panel</Link>}
          {user ? (
            <button onClick={handleLogout} className="btn-outline text-sm mt-2 border-red-500/50 text-red-400 hover:bg-red-500/20">Logout</button>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline text-center">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
