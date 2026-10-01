import React, { useEffect, useRef } from 'react';

export default function PetalOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const particleCount = 60; // Increased by another 20% (50 -> 60)
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let globalTimeForWind = 0;
    
    class Petal {
      constructor() {
        this.reset(true);
      }
      
      reset(initial = false) {
        // Spawn across the entire top width so it comes from every branch (left, center, right)
        this.x = Math.random() * canvas.width; 
        
        this.y = initial ? Math.random() * canvas.height : -20 - Math.random() * 50;
        
        this.size = Math.random() * 4 + 3;
        this.width = this.size * (Math.random() * 0.3 + 0.6);
        this.height = this.size;
        
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 1.0; 
        
        this.angle = Math.random() * Math.PI * 2;
        this.oscillationSpeed = Math.random() * 0.03 + 0.01;
        this.oscillationAmplitude = Math.random() * 1.5 + 0.5;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // Deep red/pink to match the uploaded branch
        const isRed = Math.random() > 0.4;
        if (isRed) {
          this.color = `rgba(${200 + Math.random() * 55}, ${20 + Math.random() * 30}, ${40 + Math.random() * 40}, 0.85)`;
        } else {
          this.color = `rgba(${220 + Math.random() * 35}, ${70 + Math.random() * 50}, ${110 + Math.random() * 50}, 0.8)`;
        }
      }
      
      update(delta = 1, globalWind) {
        this.y += this.speedY * delta;
        this.x += (this.speedX + Math.sin(this.angle) * this.oscillationAmplitude + globalWind) * delta;
        this.angle += this.oscillationSpeed * delta;
        this.rotation += this.rotationSpeed * delta;
        
        if (this.y > canvas.height + 20) {
          this.reset();
        }
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.sin(this.angle) * 0.3);
        
        ctx.beginPath();
        ctx.moveTo(0, -this.height);
        ctx.quadraticCurveTo(this.width, 0, 0, this.height);
        ctx.quadraticCurveTo(-this.width, 0, 0, -this.height);
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Petal());
    }
    
    // Deterministic master clock variables
    let lastTime = performance.now();
    let animationId;
    
    const animate = (time) => {
      const delta = (time - lastTime) / 16.666; // Normalize to 60fps base speed
      lastTime = time;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      globalTimeForWind += 0.01 * delta;
      const globalWind = Math.sin(globalTimeForWind) * 1.5; 
      
      particles.forEach(p => {
        p.update(delta, globalWind);
        p.draw();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="petal-overlay-canvas" />;
}
