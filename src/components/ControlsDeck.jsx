import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Gauge, Filter } from 'lucide-react';

export default function ControlsDeck({
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  activeIndex,
  setActiveIndex,
  totalCards,
  categories,
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1rem',
      zIndex: 20
    }}>
      {/* Primary Control Toolbar */}
      <div className="controls-bar">
        {/* Play/Pause Auto-cycle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`control-btn ${isPlaying ? 'active' : ''}`}
          title={isPlaying ? "Pause Continuous Cycling" : "Start Continuous Cycling"}
        >
          {isPlaying ? <Pause size={20} color="#f59e0b" /> : <Play size={20} color="#10b981" />}
        </button>

        {/* Speed Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <Gauge size={15} color="#9ca3af" />
          {[
            { label: '2S', value: 2000 },
            { label: '4S', value: 4000 },
            { label: '6S', value: 6000 }
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              style={{
                background: speed === s.value ? 'var(--color-gold)' : 'transparent',
                color: speed === s.value ? '#000' : '#9ca3af',
                border: 'none',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Manual Left/Right Navigation */}
        <button
          onClick={() => setActiveIndex((activeIndex - 1 + totalCards) % totalCards)}
          className="control-btn"
          title="Previous Card (From Left)"
        >
          <ChevronLeft size={22} />
        </button>

        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: '#f59e0b',
          minWidth: 45,
          textAlign: 'center'
        }}>
          {activeIndex + 1} / {totalCards}
        </span>

        <button
          onClick={() => setActiveIndex((activeIndex + 1) % totalCards)}
          className="control-btn"
          title="Next Card (From Right)"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Filter size={14} color="#f59e0b" style={{ marginRight: 4 }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat
                ? 'linear-gradient(135deg, var(--color-gold), var(--color-red))'
                : 'rgba(255,255,255,0.05)',
              color: selectedCategory === cat ? '#ffffff' : '#9ca3af',
              border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.3rem 0.9rem',
              borderRadius: 20,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.25s ease'
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="dots-indicator-bar">
        {Array.from({ length: totalCards }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`dot-btn ${idx === activeIndex ? 'active-dot' : ''}`}
            title={`Jump to Card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
