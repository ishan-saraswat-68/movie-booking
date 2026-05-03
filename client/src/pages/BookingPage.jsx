import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { socket } from '../utils/socket';
import SeatLayout from '../components/SeatLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaTicketAlt, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const SEAT_PRICES = { recliner: 500, gold: 300, silver: 180 };

const getSeatCategory = (seatId) => {
  const row = seatId[0];
  if (['A', 'B'].includes(row)) return 'recliner';
  if (['C', 'D', 'E'].includes(row)) return 'gold';
  return 'silver';
};

export default function BookingPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchShow();

    // Socket Setup
    socket.connect();
    socket.emit('join-show', showId);

    const handleSeatLocked = ({ seatId, userId }) => {
      setLockedSeats((prev) => [...new Set([...prev, seatId])]);
    };

    const handleSeatUnlocked = ({ seatId }) => {
      setLockedSeats((prev) => prev.filter((s) => s !== seatId));
    };

    const handleSeatBooked = ({ seatId }) => {
      setShow((prevShow) => {
        if (!prevShow) return prevShow;
        return {
          ...prevShow,
          bookedSeats: [...new Set([...prevShow.bookedSeats, seatId])],
        };
      });
      setLockedSeats((prev) => prev.filter((s) => s !== seatId));
    };

    socket.on('seat-locked', handleSeatLocked);
    socket.on('seat-unlocked', handleSeatUnlocked);
    socket.on('seat-booked', handleSeatBooked);

    return () => {
      socket.off('seat-locked', handleSeatLocked);
      socket.off('seat-unlocked', handleSeatUnlocked);
      socket.off('seat-booked', handleSeatBooked);
      socket.disconnect();
    };
  }, [showId]);

  const fetchShow = async () => {
    try {
      const res = await api.get(`/shows/${showId}`);
      setShow(res.data.show);
      if (res.data.show.lockedSeats) {
        setLockedSeats(res.data.show.lockedSeats);
      }
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatToggle = async (seatId, isSelected) => {
    try {
      if (isSelected) {
        // Unlock
        await api.post(`/shows/${showId}/unlock`, { seatId });
        setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      } else {
        // Lock
        await api.post(`/shows/${showId}/lock`, { seatId });
        setSelectedSeats((prev) => [...prev, seatId]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock/unlock seat');
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const cat = getSeatCategory(seatId);
      const price = show?.price?.[cat] || SEAT_PRICES[cat];
      return total + price;
    }, 0);
  };

  const executeBooking = async () => {
    try {
      setPaymentTimer(null);
      setBooking(true);
      const res = await api.post('/bookings', {
        showId,
        seats: selectedSeats,
        totalAmount: calculateTotal(),
      });
      toast.success('Transmission Successful! Seats reserved. 🎉');
      navigate(`/booking-confirmation/${res.data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Uplink failed. Please retry.');
      setBooking(false);
    }
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) return toast.error('Transmission requires seat selection.');
    setPaymentTimer(10);
    
    timerRef.current = setInterval(() => {
      setPaymentTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          executeBooking();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelPayment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPaymentTimer(null);
    
    const currentSeats = [...selectedSeats];
    setSelectedSeats([]); // Optimistically clear UI
    
    try {
      await Promise.all(
        currentSeats.map(seatId => api.post(`/shows/${showId}/unlock`, { seatId }))
      );
      toast('Payment Aborted & Seats Released', { icon: '🛑' });
    } catch (err) {
      console.error('Failed to unlock seats on cancel', err);
      toast('Payment Aborted', { icon: '🛑' });
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-dark">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!show) return null;

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Show Header Info */}
      <div className="glass p-6 rounded-[32px] mb-10 flex flex-col md:flex-row gap-6 items-center border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-24 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
          <img src={show.movie.poster} alt={show.movie.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-2 block animate-glow">Currently Tuning Into</span>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1 neon-text-purple">{show.movie.title}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted font-bold text-sm">
            <span className="bg-white/5 px-3 py-1 rounded-full">{show.theatre.name}</span>
            <span className="bg-white/5 px-3 py-1 rounded-full text-accent">{format(new Date(show.date.substring(0, 10) + 'T00:00:00'), 'EEE, dd MMM')}</span>
            <span className="bg-white/5 px-3 py-1 rounded-full text-primary">{show.time}</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 glass px-6 py-4 rounded-3xl border-primary/20">
           <FaShieldAlt className="text-primary text-2xl" />
           <div>
              <p className="text-white font-black text-xs uppercase tracking-widest leading-none">Secure</p>
              <p className="text-[10px] text-muted font-bold">Uplink Encryption</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Seat Layout Section */}
        <div className="lg:col-span-2">
          <div className="glass p-10 rounded-[40px] border border-white/5 shadow-2xl relative">
             <div className="absolute top-4 left-6 flex items-center gap-2 text-muted uppercase text-[9px] font-black tracking-widest">
                <FaInfoCircle className="text-accent" />
                Select Your Transmission Nodes
             </div>
             <SeatLayout
               bookedSeats={show.bookedSeats}
               selectedSeats={selectedSeats}
               lockedSeats={lockedSeats}
               onSeatToggle={handleSeatToggle}
             />
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          {/* Price Reference */}
          <div className="glass p-8 rounded-[32px] border border-white/5">
            <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">Tariff Modules</h3>
            <div className="space-y-4">
              {[
                { name: 'Recliner', price: show?.price?.recliner || SEAT_PRICES.recliner, color: 'primary', icon: '🟣' },
                { name: 'Gold', price: show?.price?.gold || SEAT_PRICES.gold, color: 'accent', icon: '🔵' },
                { name: 'Silver', price: show?.price?.silver || SEAT_PRICES.silver, color: 'muted', icon: '⚪' }
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <p className="text-white font-black text-sm uppercase">{cat.name}</p>
                      <p className="text-[10px] text-muted font-bold tracking-widest">STANDARD UNIT</p>
                    </div>
                  </div>
                  <span className="text-white font-black">₹{cat.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Hub */}
          <div className="glass p-8 rounded-[40px] border-2 border-primary/20 shadow-[0_0_50px_rgba(124,58,237,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <FaTicketAlt className="text-primary" />
               Checkout Hub
            </h3>

            {selectedSeats.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {['recliner', 'gold', 'silver'].map((cat) => {
                    const catSeats = selectedSeats.filter((s) => getSeatCategory(s) === cat);
                    if (catSeats.length === 0) return null;
                    const price = show?.price?.[cat] || SEAT_PRICES[cat];
                    return (
                      <div key={cat} className="flex justify-between items-end">
                        <div>
                          <p className="text-white font-black text-xs uppercase">{cat} × {catSeats.length}</p>
                          <p className="text-[10px] text-accent font-bold tracking-tighter">{catSeats.join(', ')}</p>
                        </div>
                        <span className="text-white font-bold text-sm">₹{price * catSeats.length}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-muted font-black text-xs uppercase tracking-widest">Total Energy</span>
                    <span className="text-3xl font-black text-white neon-text-purple">₹{totalAmount}</span>
                  </div>
                  
                  {paymentTimer !== null ? (
                    <div className="space-y-3">
                      <div className="w-full bg-dark rounded-full h-2 mb-2 overflow-hidden border border-white/5">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-1000 ease-linear shadow-neon-cyan" 
                          style={{ width: `${(paymentTimer / 10) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent animate-pulse">Processing... {paymentTimer}s</span>
                        <button 
                          onClick={handleCancelPayment}
                          className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                        >
                          Abort
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleBooking}
                      disabled={booking}
                      className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-neon-purple group"
                    >
                      {booking ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Initialize Payment
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <FaTicketAlt className="text-muted text-xl opacity-20" />
                 </div>
                 <p className="text-muted font-black text-[10px] uppercase tracking-[0.2em]">Awaiting Seat Uplink</p>
              </div>
            )}
          </div>
          
          <p className="text-[9px] text-center text-muted font-black uppercase tracking-[0.3em] opacity-40">
            Encrypted by Cine-Shield V4.2
          </p>
        </div>
      </div>
    </div>
  );
}
