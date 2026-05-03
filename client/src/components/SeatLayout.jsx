import { useState } from 'react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = 10;

const getSeatCategory = (row) => {
  if (['A', 'B'].includes(row)) return { label: 'Recliner', key: 'recliner' };
  if (['C', 'D', 'E'].includes(row)) return { label: 'Gold', key: 'gold' };
  return { label: 'Silver', key: 'silver' };
};

export default function SeatLayout({ bookedSeats = [], selectedSeats, lockedSeats = [], onSeatToggle }) {
  return (
    <div className="w-full select-none">
      {/* Futuristic Screen */}
      <div className="text-center mb-12 relative">
        <div className="mx-auto w-4/5 h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full mb-2 blur-[1px] animate-glow" />
        <div className="mx-auto w-3/4 h-8 bg-gradient-to-b from-accent/20 to-transparent rounded-[100%] absolute top-1 left-1/2 -translate-x-1/2 blur-2xl" />
        <p className="text-accent text-[10px] font-black tracking-[0.3em] uppercase opacity-80">STARS AND SCREEN THIS WAY</p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mb-10 text-xs font-bold uppercase tracking-widest flex-wrap">
        {[
          { label: 'Available', className: 'bg-dark border-white/10' },
          { label: 'Selected', className: 'bg-primary border-white/20 shadow-neon-purple' },
          { label: 'Locked', className: 'bg-orange-500/20 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' },
          { label: 'Booked', className: 'bg-white/5 border-white/5 opacity-30' },
        ].map(({ label, className }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-md border-2 ${className}`} />
            <span className="text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Seats Container */}
      <div className="space-y-6">
        {ROWS.map((row) => {
          const cat = getSeatCategory(row);
          return (
            <div key={row} className="relative">
              {(row === 'A' || row === 'C' || row === 'F') && (
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                    {cat.label} Section
                  </p>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
              )}
              <div className="flex items-center gap-2 justify-center">
                <span className="w-8 text-center text-accent/50 text-xs font-black">{row}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: COLS }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    const isBooked = bookedSeats.includes(seatId);
                    const isLocked = lockedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    
                    return (
                      <button
                        key={seatId}
                        disabled={isBooked || (isLocked && !isSelected)}
                        onClick={() => !isBooked && onSeatToggle(seatId, isSelected)}
                        title={seatId}
                        className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 text-[10px] font-black transition-all duration-300 transform
                          ${isBooked ? 'bg-white/5 border-transparent opacity-20 cursor-not-allowed scale-90' :
                            isSelected ? 'bg-primary border-white/30 text-white shadow-neon-purple scale-110 rotate-3 z-10' :
                            isLocked ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)] cursor-not-allowed scale-95' :
                              'bg-card border-white/5 text-muted hover:border-accent/50 hover:text-white hover:shadow-neon-cyan hover:-translate-y-1 cursor-pointer'}
                        `}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 p-6 glass rounded-2xl text-center">
        <p className="text-muted font-medium">Selected Seats: <span className="text-white font-black">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></p>
      </div>
    </div>
  );
}
