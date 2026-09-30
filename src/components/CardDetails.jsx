import React from 'react';
import { Calendar, Clock, MapPin, Trophy, UserCheck, ArrowRight, ShieldAlert, Tag } from 'lucide-react';

export default function CardDetails({ card, totalCards, activeIndex }) {
  if (!card) return null;

  return (
    <div className="details-panel-container">
      <div key={card.id} className="details-glass-card">
        {/* Header Title & Badge */}
        <div className="details-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 800,
                color: card.rarityColor,
                letterSpacing: 1.5,
                textTransform: 'uppercase'
              }}>
                CARD #{activeIndex + 1} OF {totalCards} • {card.category}
              </span>
            </div>
            <h1 className="event-title-main text-gold-gradient">{card.title}</h1>
            <h2 className="event-subtitle-sub">{card.subtitle}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span className="badge-flagship">{card.badge || 'MERIDIAN FEATURED'}</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: '#9ca3af',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700
            }}>
              <UserCheck size={14} color="#f59e0b" />
              <span>{card.speakerOrHost}</span>
            </div>
          </div>
        </div>

        {/* Info Grid (Schedule, Venue, Prize Pool) */}
        <div className="info-pills-grid">
          <div className="info-pill">
            <div className="pill-icon">
              <Calendar size={20} />
            </div>
            <div className="pill-content">
              <span className="pill-label">DATE & SCHEDULE</span>
              <span className="pill-value">{card.date}</span>
            </div>
          </div>

          <div className="info-pill">
            <div className="pill-icon" style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444' }}>
              <Clock size={20} />
            </div>
            <div className="pill-content">
              <span className="pill-label">TIMING / DURATION</span>
              <span className="pill-value">{card.time}</span>
            </div>
          </div>

          <div className="info-pill">
            <div className="pill-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <MapPin size={20} />
            </div>
            <div className="pill-content">
              <span className="pill-label">LOCATION / VENUE</span>
              <span className="pill-value">{card.venue}</span>
            </div>
          </div>

          <div className="info-pill">
            <div className="pill-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <Trophy size={20} />
            </div>
            <div className="pill-content">
              <span className="pill-label">PRIZE / REWARD</span>
              <span className="pill-value">{card.prizePool}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h4 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.85rem',
            color: '#f59e0b',
            letterSpacing: '1px',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <ShieldAlert size={15} /> OVERVIEW & MISSION
          </h4>
          <p className="description-text">{card.description}</p>
        </div>

        {/* Tags & Action Call to Action */}
        <div className="action-cta-bar">
          <div className="tags-list">
            <Tag size={15} color="#9ca3af" style={{ alignSelf: 'center' }} />
            {card.tags && card.tags.map((tag, idx) => (
              <span key={idx} className="tag-badge">
                #{tag}
              </span>
            ))}
          </div>

          <button 
            className="register-btn"
            onClick={() => alert(`Registration for ${card.title} opened! Prepare your squad for Meridian Summit '26.`)}
          >
            <span>REGISTER FOR {card.category.toUpperCase()}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
