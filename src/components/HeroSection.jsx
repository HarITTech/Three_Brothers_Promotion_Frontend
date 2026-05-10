import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './HeroSection.css';
import heroBg1 from '../assets/images/hero-bg-1.png';
import heroBg2 from '../assets/images/hero-bg-2.png';
import logoImg from '../assets/images/logo1.png';

const WA_URL = 'https://wa.me/919128006318?text=Hi%2C%20I%20would%20like%20to%20book%20a%20discovery%20call.';

const FOUNDERS = [
  {
    key: 'riya',
    name: 'Riya Upreti',
    label: 'Founder',
    img: heroBg1,
    imgClass: 'founder-img riya',
    card1Heading: 'Mega Creator',
    card1Text: '2.5M Followers',
    card2Heading: '100M+',
    card2Text: 'Views',
  },
  {
    key: 'vibhav',
    name: 'Vibhav Raj',
    label: 'Co-Founder',
    img: heroBg2,
    imgClass: 'founder-img vibhav',
    card1Heading: 'Personal Branding Expert',
    card1Text: '',
    card2Heading: 'Scaled 70+ Clients to 7 Figures',
    card2Text: '',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [apiData, setApiData] = useState(null);
  const timerRef = useRef(null);
  const cursorRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('hero-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const activeFounders = apiData?.teamMember?.length > 0
    ? apiData.teamMember
        .filter(m => !m.mainRole || m.mainRole === 'admin')
        .map((m, i) => ({
          key: m._id || `member-${i}`,
          name: m.name,
          label: m.role,
          img: m.image,
          imgClass: i === 0 ? 'founder-img riya' : 'founder-img vibhav',
          badge: m.badge,
          instagramId: m.instagramId,
          linkedInId: m.linkedInId,
          desc: m.desc,
          card1Heading: m.card1Heading,
          card1Text: m.card1Text,
          card2Heading: m.card2Heading,
          card2Text: m.card2Text,
        }))
    : FOUNDERS;

  // Auto-slide
  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % activeFounders.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [activeFounders.length]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % activeFounders.length), 4500);
  };

  // Cursor light
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const move = (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.opacity = '1';
    };
    const leave = () => { el.style.opacity = '0'; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', leave);
    };
  }, []);

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX.current;
    if (dx < -50) goTo((current + 1) % activeFounders.length);
    else if (dx > 50) goTo((current - 1 + activeFounders.length) % activeFounders.length);
  };

  const currentMember = activeFounders[current];

  return (
    <div className="fobet-hero-wrapper" id="home">
      {/* Cursor light */}
      <div className="cursor-light" ref={cursorRef} style={{ opacity: 0 }} />

      {/* Background */}
      <div className="noise-overlay" />
      <div className="particles" />
      <div className="bg-elements">
        <i className="fa-solid fa-sparkles bg-icon icon-1" />
        <i className="fa-solid fa-rocket bg-icon icon-3" />
        <i className="fa-solid fa-heart bg-icon icon-8" />
      </div>
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />

      <section className="hero-redesigned">
        <div className="hero-container">
          {/* ── Left content ── */}
          <div className="content-wrapper">
            <div className="logo-badge hero-fade-in delay-1">
              <div className="logo-icon">
                <img src={logoImg} alt="TB" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
              </div>
              <span className="logo-text">{apiData?.heroTag || 'Three Brothers Promotions'}</span>
            </div>

            <div className="hero-headline hero-fade-in delay-2">
              {apiData?.heroHeading1 ? (
                <>
                  {apiData.heroHeading1.split('\\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                  {' '}
                  {apiData.heroHeading2 && (
                    <span className="gradient-text">{apiData.heroHeading2}</span>
                  )}
                  {' '}
                  {apiData.heroHeading3 && (
                    <span className="underline-wrapper">
                      <span className="gradient-text">{apiData.heroHeading3}</span>
                      <svg className="svg-underline" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <path d="M2.00025 6.99997C25.7501 2.99991 74.8003 7.50002 99.0003 4.49997C124 1.50002 150.908 -0.999992 198.001 2.50001" stroke="url(#underlineGradient)" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </>
              ) : (
                <>
                  We make your business<br />
                  <span className="gradient-text">impossible to</span>{' '}
                  <span className="underline-wrapper">
                    <span className="gradient-text">ignore.</span>
                    <svg className="svg-underline" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="underlineGradientDefault" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path d="M2.00025 6.99997C25.7501 2.99991 74.8003 7.50002 99.0003 4.49997C124 1.50002 150.908 -0.999992 198.001 2.50001" stroke="url(#underlineGradientDefault)" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </>
              )}
            </div>

            <div className="hero-fade-in delay-3" style={{ marginBottom: '40px' }}>
              <h1 className="hero-description" style={{ marginBottom: '8px' }}>
                {apiData?.heroDesc1 || 'Done-for-you Personal Branding Agency that converts strangers into customers.'}
              </h1>
              {apiData?.heroDesc2 && (
                <p className="hero-description" dangerouslySetInnerHTML={{ __html: apiData.heroDesc2 }} />
              )}
            </div>

            <div className="cta-wrapper hero-fade-in delay-4">
              <a href={apiData?.whatsappUrl || WA_URL} className="btn-primary" target="_blank" rel="noopener noreferrer">
                <span>Book Strategy Call</span>
                <i className="fa-solid fa-arrow-right" />
              </a>
              <a href="#results" className="btn-secondary">
                <i className="fa-solid fa-play" />
                <span>See Results</span>
              </a>
            </div>
          </div>

          {/* ── Founder slider ── */}
          <div
            className="founder-section"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="founder-stage-container">
              <div className="founder-glow" />
              <div className="founder-arch" />

              <div className="founder-slider-wrapper">
                {activeFounders.map((f, i) => (
                  <div key={f.key} className={`founder-slide${current === i ? ' active' : ''}`}>
                    <img src={f.img} alt={f.name} className={f.imgClass} draggable={false} loading="lazy" />

                    {/* Dynamic Floating Cards per Founder */}
                    {f.card1Heading && (
                      <div className={`float-card ${i === 0 ? 'card-stats-riya' : 'card-stats-vibhav'}`}>
                        {i === 0 ? (
                          <div className="stat-icon"><i className="fa-solid fa-star" /></div>
                        ) : null}
                        <div className={i === 0 ? "stat-content" : "stat-content-text"}>
                          {i === 0 ? (
                            <>
                              <h4>{f.card1Heading}</h4>
                              <p>{f.card1Text}</p>
                            </>
                          ) : (
                            <strong>{f.card1Heading}</strong>
                          )}
                        </div>
                      </div>
                    )}

                    {f.card2Heading && (
                      <div className={`float-card ${i === 0 ? 'card-views-riya' : 'card-stats-vibhav-2'}`}>
                        {i === 0 && (
                          <div className="stat-icon stat-icon-green"><i className="fa-solid fa-eye" /></div>
                        )}
                        <div className={i === 0 ? "stat-content" : "stat-content-text"}>
                          {i === 0 ? (
                            <>
                              <h4>{f.card2Heading}</h4>
                              <p><i className="fa-solid fa-caret-up" /> {f.card2Text}</p>
                            </>
                          ) : (
                            f.card2Heading
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`float-card ${i === 0 ? 'card-social-riya' : 'card-social-vibhav'}`}>
                      <div className="social-links">
                        {f.instagramId && (
                          <a href={f.instagramId} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-instagram" /></a>
                        )}
                        {f.linkedInId && (
                          <a href={f.linkedInId} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-linkedin" /></a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="founder-info-container">
              {activeFounders.map((f, i) => (
                <div key={f.key} className={`info-slide${current === i ? ' active' : ''}`}>
                  <p className="founder-label">{f.label}</p>
                  <h3 className="founder-name">{f.name}</h3>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="slider-controls">
              {activeFounders.map((_, i) => (
                <button
                  key={i}
                  className={`slider-dot${current === i ? ' active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
