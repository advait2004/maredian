import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onAddCard }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Custom Event');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !imagePreview) {
      alert('Please provide a card title and select a photo!');
      return;
    }

    const newCard = {
      id: `custom-card-${Date.now()}`,
      title: title.toUpperCase(),
      subtitle: subtitle || 'Custom User Photo Card',
      category: category || 'Custom',
      power: Math.floor(Math.random() * 15) + 85,
      rarity: 'CUSTOM ULTRA',
      rarityColor: '#e11d48',
      date: 'OCT 5-7, 2026',
      time: 'CUSTOM SCHEDULE',
      venue: 'Meridian Summit Ground',
      prizePool: 'Special Recognition',
      image: imagePreview,
      description: description || 'Custom user photo card added to the Meridian Summit deck.',
      tags: ['Custom Photo', 'User Submitted', 'Meridian '],
      speakerOrHost: 'Submitted by User',
      stats: { attack: 92, defense: 88, strategy: 95 },
      badge: 'USER PHOTO'
    };

    onAddCard(newCard);
    onClose();
    // Reset form
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImagePreview(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#f59e0b" />
            <h3 style={{ fontFamily: 'Orbitron, sans-serif', color: '#fff', fontSize: '1.2rem' }}>
              ADD YOUR PHOTO CARD
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              CARD TITLE *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. GAMING ARENA CHAMPIONSHIP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              SUBTITLE / EVENT TYPE
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Esports Tournament & Showcase"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* Photo Drop area */}
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              PHOTO / IMAGE *
            </label>
            <div style={{
              border: '2px dashed rgba(245,158,11,0.4)',
              borderRadius: 12,
              padding: '1.25rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              {imagePreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: 120, height: 140, objectFit: 'cover', borderRadius: 8, border: '2px solid #f59e0b' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Photo Loaded! Click to Change.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={32} color="#f59e0b" />
                  <span style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: 600 }}>
                    Click or Drag Photo Here
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Supports PNG, JPG, WEBP</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              DESCRIPTION
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Describe your custom card details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #dc2626)',
              color: '#fff',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              padding: '0.85rem',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 0 15px rgba(245,158,11,0.4)'
            }}
          >
            <Upload size={18} />
            CREATE & ADD TO DECK
          </button>
        </form>
      </div>
    </div>
  );
}
