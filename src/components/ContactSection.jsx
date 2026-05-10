import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ContactSection.css';
import contactImg from '../assets/images/contact.jpeg';

const WA_URL = 'https://wa.me/919128006318';

const PARTICLES = [
  { left: '10%', animationDelay: '0s' },
  { left: '25%', animationDelay: '4s' },
  { left: '40%', animationDelay: '7s' },
  { left: '65%', animationDelay: '2s' },
  { left: '82%', animationDelay: '9s' },
];

export default function ContactSection() {
  const [apiData, setApiData] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('contact-section');
      if (data) setApiData(data);

      const heroData = await api.getSectionData('hero-section');
      if (heroData && heroData.whatsappUrl) {
        setWhatsappUrl(heroData.whatsappUrl);
      }
      if (heroData && heroData.whatsappNumber) {
        setWhatsappNumber(heroData.whatsappNumber);
      }
    };
    loadData();
  }, []);

  return (
    <div className="contact-section-wrapper" id="contact">
      <div className="contact-grid-proof">
        <div className="contact-bg-grid-wrap">
          <div className="contact-bg-grid" />
          <div className="contact-bg-glow" />
        </div>

        {PARTICLES.map((p, i) => (
          <div key={i} className="contact-particle" style={{ left: p.left, animationDelay: p.animationDelay }} />
        ))}

        <div className="contact-grid">
          <div className="img-wrap">
            <img src={apiData?.image || contactImg} alt="Contact Three Brothers Promotion" decoding="async" />
          </div>

          <div className="contact-text">
            <div className="contact-badge">{apiData?.contactTag || 'GET IN TOUCH'}</div>
            <h2>
              {apiData?.heading1 ? (
                <>
                  {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
                </>
              ) : (
                <>
                  Contact <span className="gradient-text">Us</span>
                </>
              )}
            </h2>
            <p>
              {apiData?.desc1 ? (
                apiData.desc1.includes('<strong>') ? (
                  <span dangerouslySetInnerHTML={{ __html: apiData.desc1 }} />
                ) : (
                  apiData.desc1
                )
              ) : (
                <>
                  Have questions about our packages or want to see if we're a good fit? We're available <strong>24/7</strong> to help you scale.
                </>
              )}
              {apiData?.desc2 && (
                <>
                  <br /><br />
                  {apiData.desc2.includes('<strong>') ? (
                    <span dangerouslySetInnerHTML={{ __html: apiData.desc2 }} />
                  ) : (
                    apiData.desc2
                  )}
                </>
              )}
              {!apiData?.desc1 && !apiData?.desc2 && (
                <>
                  <br /><br />
                  Reach us anytime on WhatsApp.
                </>
              )}
            </p>
            <a href={whatsappUrl || WA_URL} className="wa-btn" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp" /> Chat on WhatsApp
            </a>
            <div className="contact-note">
              <i className="fa-brands fa-whatsapp" /> WhatsApp: <strong>{whatsappNumber || '+91 91280 06318'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
