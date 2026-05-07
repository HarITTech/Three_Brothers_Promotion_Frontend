import { useState, useEffect } from 'react';
import './LeadModal.css';

const WA_URL = 'https://wa.me/919128006318?text=Hi%2C%20I%20would%20like%20to%20book%20a%20discovery%20call.';

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 0 && !localStorage.getItem('modalDismissed')) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('modalDismissed', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className={`lead-modal-overlay ${isOpen ? 'active' : ''}`} onClick={closeModal}>
      <div className="lead-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>&times;</button>
        <div className="modal-badge">WAIT! BEFORE YOU GO...</div>
        <h2 className="modal-headline">
          Ready to Scale Your <span className="gradient-text">Brand?</span>
        </h2>
        <p className="modal-sub">
          Book your <strong>Free Strategy Session</strong> with Vibhav Raj today and get a custom roadmap for your creator journey.
        </p>
        <a href={WA_URL} className="modal-cta" target="_blank" rel="noopener noreferrer">
          Book My Call <i className="fa-brands fa-whatsapp"></i>
        </a>
        <button className="modal-dismiss" onClick={closeModal}>No thanks, I'll figure it out myself</button>
      </div>
    </div>
  );
}
