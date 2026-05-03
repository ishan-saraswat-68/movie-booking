import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { FaFilm, FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-dark">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4 group cursor-pointer">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
              <FaFilm className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-black text-white neon-text-purple tracking-tighter uppercase italic">CINEVERSE</h1>
          </div>
          <p className="text-muted font-bold tracking-widest uppercase text-xs">Authorize Access to the Hub</p>
        </div>

        <div className="glass p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Email Terminal</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="name@cineverse.io"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Secure Key</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-neon-purple disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Session
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-muted text-sm font-medium">
              New to the system?{' '}
              <Link to="/register" className="text-accent font-bold hover:neon-text-cyan transition-all">Create Identity</Link>
            </p>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Protocol V4.2</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
