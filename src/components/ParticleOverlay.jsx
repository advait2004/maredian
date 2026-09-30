import React, { useEffect, useRef } from 'react';

export default function ParticleOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up particles
    const particles = [];
    const particleCount = 80; // Reasonable amount for a dense but clean effect
    
    // Adjust canvas size
    const resizeCanvas = () => {
      // Use parent's dimensions if available, otherwise window
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    
    // Initialize size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle Class
    class Particle {
      constructor() {
        this.reset();
        // Initial scatter across the entire screen so it's instantly populated
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.opacity = this.baseOpacity;
      }
      
      reset() {
        // When resetting from an edge, usually we want to spawn at the bottom or sides
        const spawnEdge = Math.floor(Math.random() * 3);
        if (spawnEdge === 0) { // Bottom
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        } else if (spawnEdge === 1) { // Left
          this.x = -10;
          this.y = Math.random() * canvas.height;
        } else { // Right
          this.x = canvas.width + 10;
          this.y = Math.random() * canvas.height;
        }
        
        // Motes vary in size, some tiny, some slightly larger
        this.size = Math.random() * 2.0 + 0.5;
        
        // Very slow, dreamy movement
        this.speedY = (Math.random() - 0.8) * 0.4; // Mostly slowly upwards
        this.speedX = (Math.random() - 0.5) * 0.4;
        
        this.baseOpacity = Math.random() * 0.4 + 0.1;
        this.opacity = 0; // start transparent and fade in
        
        // Slower flicker/pulse for dust
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
        
        // Pre-calculate color so it doesn't flicker wildly every frame
        const goldRatio = Math.random();
        this.r = Math.floor(255 - (255 - 230) * goldRatio);
        this.g = Math.floor(255 - (255 - 195) * goldRatio);
        this.b = Math.floor(255 - (255 - 135) * goldRatio);
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Gentle organic wafting
        this.angle += this.pulseSpeed;
        this.x += Math.sin(this.angle) * 0.15;
        this.y += Math.cos(this.angle) * 0.1;
        
        // Pulse opacity smoothly
        this.opacity = this.baseOpacity + Math.sin(this.angle) * 0.2;
        if (this.opacity < 0) this.opacity = 0;
        
        // Reset if it drifts far off screen
        if (this.y < -20 || this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset();
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
        ctx.fill();
        
        // Soft glowing halo
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = `rgba(230, 195, 135, ${this.opacity})`;
      }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation Loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-overlay" />;
}
