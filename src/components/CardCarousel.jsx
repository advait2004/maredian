import React, { useState, useRef } from 'react';

function getSlot(index, activeIndex, total) {
  const diff = ((index - activeIndex) % total + total) % total;
  if (diff === 0) return '0';
  if (diff === 1) return '1';
  if (diff === 2) return '2';
  if (diff === total - 2) return '3';
  if (diff === total - 1) return '4';
  return 'out-right';
}

export default function CardCarousel({ cards, activeIndex, setActiveIndex }) {
  const total = cards.length;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(null);

  const handleMouseMove = (e, slot) => {
    if (slot !== '0') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (cy / (rect.height / 2)) * -7,
      y: (cx / (rect.width / 2)) * 7,
    });
  };

  const handleMouseLeave = (slot) => {
    if (slot !== '0') return;
    setTilt({ x: 0, y: 0 });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) setActiveIndex((activeIndex + 1) % total);
    else if (diff < -40) setActiveIndex((activeIndex - 1 + total) % total);
    touchStartX.current = null;
  };

  return (
    <div
      className="cards-stage"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="deck-root">
        {cards.map((card, index) => {
          const slot = getSlot(index, activeIndex, total);
          const isActive = slot === '0';

          // Only apply tilt transform to the active card when mouse moves
          const tiltStyle =
            isActive && (tilt.x !== 0 || tilt.y !== 0)
              ? {
                  transform: `translate(-50%, -50%) translateX(0px) translateY(-22px) scale(1.2) translateZ(110px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }
              : {};

          return (
            <div
              key={card.id}
              className="card-slot"
              data-slot={slot}
              style={tiltStyle}
              onMouseMove={(e) => handleMouseMove(e, slot)}
              onMouseLeave={() => handleMouseLeave(slot)}
            >
              {/*
                Structure:
                  card-gold-border  ← the gradient gold border (13px radius, 2.5px thick)
                    card-frame      ← overflow:hidden clip (10.5px radius)
                      card-sheen    ← warm specular light sweep (active only)
                      img           ← photo fills 100%, no text, no overlays
              */}
              <div className="card-gold-border">
                <div className="card-frame">
                  <div className="card-sheen" />
                  <img
                    src={card.image}
                    alt=""
                    loading="eager"
                    draggable="false"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.7s ease',
                    }}
                  />
                </div>
              </div>
              
              <div className={`card-event-title ${isActive ? 'active' : ''}`}>
                {card.eventTitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
