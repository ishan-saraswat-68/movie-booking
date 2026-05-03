import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { FaFilm, FaUser, FaEnvelope, FaPhone, FaLock, FaShieldAlt } from 'react-icons/fa';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (user) navigate('/');
    return () => dispatch(clearError());
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Encryption keys do not match!');
    try {
      await dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password })).unwrap();
      toast.success('Identity Created Successfully!');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  const field = (key, label, type = 'text', placeholder = '', Icon) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
        <input
          type={type}
          required={key !== 'phone'}
          className="input-field pl-12"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-dark">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse duration-700" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4 group cursor-pointer">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
              <FaFilm className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-black text-white neon-text-purple tracking-tighter uppercase italic">CINEVERSE</h1>
          </div>
          <p className="text-muted font-bold tracking-widest uppercase text-xs">Create Your Digital Identity</p>
        </div>

        <div className="glass p-10 md:p-12 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {field('name', 'Full Identity', 'text', 'Commander Cody', FaUser)}
              {field('email', 'Email Node', 'email', 'node@cineverse.io', FaEnvelope)}
              {field('phone', 'Comms Link (Optional)', 'tel', '+91 XXXXX XXXXX', FaPhone)}
              {field('password', 'Security Cipher', 'password', '••••••••', FaLock)}
            </div>
            {field('confirmPassword', 'Confirm Cipher', 'password', '••••••••', FaShieldAlt)}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-accent w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-neon-cyan disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Registration
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-muted text-sm font-medium">
              Already have an identity?{' '}
              <Link to="/login" className="text-primary font-bold hover:neon-text-purple transition-all">Authorized Entry</Link>
            </p>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Global Cine-Grid V4.2</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
