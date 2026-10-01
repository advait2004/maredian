import React, { useState, useEffect } from 'react';
import CardCarousel from './components/CardCarousel';
import ParticleOverlay from './components/ParticleOverlay';
import PetalOverlay from './components/PetalOverlay';
import { INITIAL_CARDS } from './data/cardsData';
import './App.css';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = INITIAL_CARDS.length;

  // Deterministic Master Clock Engine
  // Instead of a fragile setInterval, we mathematically lock the active card 
  // to the absolute elapsed time since the app mounted.
  useEffect(() => {
    let start = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - start;
      
      // Calculate which card should be active right now.
      // E.g., at 0s->0, 3.2s->1, 6.4s->2, etc.
      const targetIndex = Math.floor(elapsed / 3200) % total;
      
      setActiveIndex(prev => {
        if (prev !== targetIndex) return targetIndex;
        return prev;
      });
      
      frameId = requestAnimationFrame(tick);
    };
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [total]);

  return (
    <div className="poster-stage">
      {/* Exact poster canvas — aspect ratio 724 : 1024 */}
      <div className="poster-canvas">
        {/* Video Background */}
        <video
          className="poster-bg"
          src="/assets/cherry_blossom_bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Custom Blossom Branch (Left Top) */}
        <img 
          src="/assets/blossom_branch_new.png" 
          alt="Blossom Branch Left 1" 
          className="custom-blossom-branch custom-blossom-branch-left" 
          draggable="false"
        />
        {/* Custom Blossom Branch (Left Bottom) */}
        <img 
          src="/assets/blossom_branch_new.png" 
          alt="Blossom Branch Left 2" 
          className="custom-blossom-branch custom-blossom-branch-left-2" 
          draggable="false"
        />

        {/* Custom Blossom Branch (Right Top) */}
        <img 
          src="/assets/blossom_branch_new.png" 
          alt="Blossom Branch Right 1" 
          className="custom-blossom-branch custom-blossom-branch-right" 
          draggable="false"
        />
        {/* Custom Blossom Branch (Right Bottom) */}
        <img 
          src="/assets/blossom_branch_new.png" 
          alt="Blossom Branch Right 2" 
          className="custom-blossom-branch custom-blossom-branch-right-2" 
          draggable="false"
        />

        {/* Custom Blossom Branch (Center) */}
        <img 
          src="/assets/blossom_branch_new.png" 
          alt="Blossom Branch Center" 
          className="custom-blossom-branch custom-blossom-branch-center" 
          draggable="false"
        />

        {/* Falling Petals */}
        <PetalOverlay />

        {/* Meridian Logo with Glare */}
        <div className="logo-container">
          <img
            className="poster-logo"
            src="/assets/meridian_logo_new.png"
            alt="Meridian Logo"
            draggable="false"
          />
          <div key={activeIndex} className="logo-glare" />
        </div>

        {/* Date Display */}
        <div className="poster-date-display">
          <span className="lit-text lit-1 month">OCT</span>
          <span className="lit-text lit-2">5</span>,
          <span className="lit-text lit-3">6</span>,
          <span className="lit-text lit-4">7</span>
        </div>

        {/* Subtle dark vignette so cards read clearly */}
        <div className="poster-vignette" />

        {/* 5-Card 3D Spatial Animation */}
        <CardCarousel
          cards={INITIAL_CARDS}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />

        {/* Bottom Left Logos (SDG) */}
        <div className="bottom-left-logos">
          <div className="sdg-logo-wrapper">
            <img src="/assets/sdg4.png" alt="SDG 4" />
            <div key={activeIndex} className="sdg-glare sdg4-glare" />
          </div>
          <div className="sdg-logo-wrapper">
            <img src="/assets/sdg9.png" alt="SDG 9" />
            <div key={activeIndex} className="sdg-glare sdg9-glare" />
          </div>
        </div>

        {/* Bottom Center Logo (CESA) */}
        <div className="bottom-center-logo-container">
          <img src="/assets/cesa_logo.png" alt="CESA Logo" />
          <div key={activeIndex} className="bottom-logo-glare cesa-glare" />
        </div>

        {/* Silver Jubilee Logo */}
        <div className="bottom-jubilee-logo-container">
          <img src="/assets/silver_jubilee_logo.png" alt="Silver Jubilee" />
          <div key={activeIndex} className="bottom-logo-glare jubilee-glare" />
        </div>

        {/* Jyothi Engineering College Logo */}
        <div className="bottom-jyothi-logo-container">
          <img src="/assets/jyothi_logo.png" alt="Jyothi Engineering College" />
          <div key={activeIndex} className="bottom-logo-glare jyothi-glare" />
        </div>

        {/* Flame/Flare Particle Overlay */}
        <ParticleOverlay />
      </div>
    </div>
  );
}
