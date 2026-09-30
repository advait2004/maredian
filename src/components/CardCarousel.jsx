import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

function getSlot(index, activeIndex, total) {
  const diff = ((index - activeIndex) % total + total) % total;
  if (diff === 0) return '0';
  if (diff === 1) return '1';
  if (diff === 2) return '2';
  if (diff === total - 2) return '3';
  if (diff === total - 1) return '4';
  return 'out-right';
}

const slotVariants = {
  "0": { x: 0, y: -22, scale: 1.2, z: 110, rotateX: 0, rotateY: 0, opacity: 1, zIndex: 50 },
  "1": { x: 280, y: 10, scale: 0.9, z: 40, rotateX: 0, rotateY: -20, opacity: 0.9, zIndex: 40 },
  "2": { x: 500, y: 20, scale: 0.7, z: 0, rotateX: 0, rotateY: -35, opacity: 0.6, zIndex: 30 },
  "3": { x: -500, y: 20, scale: 0.7, z: 0, rotateX: 0, rotateY: 35, opacity: 0.6, zIndex: 30 },
  "4": { x: -280, y: 10, scale: 0.9, z: 40, rotateX: 0, rotateY: 20, opacity: 0.9, zIndex: 40 },
  "out-right": { x: 800, y: 40, scale: 0.5, z: -50, rotateX: 0, rotateY: -45, opacity: 0, zIndex: 20 }
};

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

          const currentVariant = { ...slotVariants[slot] };
          if (isActive && (tilt.x !== 0 || tilt.y !== 0)) {
            currentVariant.rotateX = tilt.x;
            currentVariant.rotateY = tilt.y;
          }

          return (
            <motion.div
              key={card.id}
              className="card-slot"
              animate={currentVariant}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onMouseMove={(e) => handleMouseMove(e, slot)}
              onMouseLeave={() => handleMouseLeave(slot)}
            >
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
                      display: 'block'
                    }}
                  />
                </div>
              </div>
              
              <div className={`card-event-title ${isActive ? 'active' : ''}`}>
                {card.eventTitle}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
