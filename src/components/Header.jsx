import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Volume2, VolumeX, PlusCircle } from 'lucide-react';

export default function Header({ onOpenUpload }) {
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, mins: 42, secs: 15 });

  // Countdown timer simulation to OCT 5, 2026
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header-container">
      <div className="brand-title">
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #dc2626, #f59e0b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(245,158,11,0.5)'
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <span className="text-gold-gradient">MERIDIAN</span>
          <span style={{ color: '#ffffff', marginLeft: 6 }}>SUMMIT '26</span>
        </div>
        <span className="brand-badge">HACKATHENA</span>
      </div>

      {/* Countdown Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(0,0,0,0.5)',
        padding: '0.4rem 1rem',
        borderRadius: 12,
        border: '1px solid rgba(245,158,11,0.25)'
      }}>
        <Calendar size={16} color="#f59e0b" />
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>SUMMIT STARTS IN:</span>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
          <span style={{ color: '#f59e0b' }}>{String(timeLeft.days).padStart(2, '0')}D</span> :{' '}
          <span>{String(timeLeft.hours).padStart(2, '0')}H</span> :{' '}
          <span>{String(timeLeft.mins).padStart(2, '0')}M</span> :{' '}
          <span style={{ color: '#ef4444' }}>{String(timeLeft.secs).padStart(2, '0')}S</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="control-btn"
          title={isMuted ? "Unmute Ambient SFX" : "Mute Ambient SFX"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} color="#f59e0b" />}
        </button>

        <button
          onClick={onOpenUpload}
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(220,38,38,0.2))',
            border: '1px solid var(--color-gold)',
            color: '#f59e0b',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.5rem 1rem',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(220,38,38,0.2))'}
        >
          <PlusCircle size={16} />
          ADD YOUR PHOTO
        </button>
      </div>
    </header>
  );
}
