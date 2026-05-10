import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './LeadModal.css';

const WA_URL = 'https://wa.me/?text=Hi%2C%20I%20would%20like%20to%20book%20a%20discovery%20call.';

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('hero-section');
      if (data) {
        if (data.whatsappUrl) {
          setWhatsappUrl(data.whatsappUrl);
        } else if (data.whatsappNumber) {
          // Construct wa.me URL from number if URL is not provided
          const cleanNum = data.whatsappNumber.replace(/\D/g, '');
          setWhatsappUrl(`https://wa.me/${cleanNum}?text=Hi%20I%20would%20like%20to%20book%20a%20discovery%20call.`);
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.3 && !sessionStorage.getItem('fobet_lead_submitted')) {
        setIsOpen(true);
        sessionStorage.setItem('fobet_lead_submitted', 'true');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
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
        <a href={whatsappUrl || WA_URL} className="modal-cta" target="_blank" rel="noopener noreferrer">
          Book My Call <i className="fa-brands fa-whatsapp"></i>
        </a>
        <button className="modal-dismiss" onClick={closeModal}>No thanks, I'll figure it out myself</button>
      </div>
    </div>
  );
}
