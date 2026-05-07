import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './HeroSection.css';
import heroBg1 from '../assets/images/hero-bg-1.png';
import heroBg2 from '../assets/images/hero-bg-2.png';

const WA_URL = 'https://wa.me/919128006318?text=Hi%2C%20I%20would%20like%20to%20book%20a%20discovery%20call.';

const FOUNDERS = [
  {
    key: 'riya',
    name: 'Riya Upreti',
    label: 'Founder',
    img: heroBg1,
    imgClass: 'founder-img riya',
    cards: ['card-stats-riya', 'card-social-riya', 'card-views-riya'],
  },
  {
    key: 'vibhav',
    name: 'Vibhav Raj',
    label: 'Co-Founder',
    img: heroBg2,
    imgClass: 'founder-img vibhav',
    cards: ['card-stats-vibhav', 'card-stats-vibhav-2', 'card-social-vibhav'],
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
    ? apiData.teamMember.map((m, i) => ({
        key: m._id || `member-${i}`,
        name: m.name,
        label: m.role,
        img: m.image,
        imgClass: i === 0 ? 'founder-img riya' : 'founder-img vibhav',
        cards: i === 0 ? ['card-stats-riya', 'card-social-riya', 'card-views-riya'] : ['card-stats-vibhav', 'card-stats-vibhav-2', 'card-social-vibhav'],
        badge: m.badge,
        instagramId: m.instagramId,
        linkedInId: m.linkedInId,
        desc: m.desc
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

  return (
    <div className="fobet-hero-wrapper" id="home">
      {/* Cursor light */}
      <div className="cursor-light" ref={cursorRef} style={{ opacity: 0 }} />

      {/* Background */}
      <div className="noise-overlay" />
      <div className="particles" />
      <div className="bg-elements">
        <i className="fa-solid fa-chart-line bg-icon icon-1" />
        <i className="fa-solid fa-star bg-icon icon-3" />
        <i className="fa-solid fa-bolt bg-icon icon-8" />
      </div>
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />

      <section className="hero-redesigned">
        <div className="hero-container">
          {/* ── Left content ── */}
          <div className="content-wrapper">
            <div className="logo-badge hero-fade-in delay-1">
              <div className="logo-icon">FM</div>
              <span className="logo-text">{apiData?.heroTag || 'Fobet Media'}</span>
            </div>

            <span className="hero-headline hero-fade-in delay-2">
              {apiData?.heroHeading1 ? (
                <>
                  {apiData.heroHeading1}{' '}
                  {apiData.heroHeading2 && (
                    <>
                      <span className="gradient-text">Performance-Driven</span>{' '}
                      Creator{' '}
                      <span className="underline-wrapper">
                        {apiData.heroHeading2}
                        <svg className="svg-underline" viewBox="0 0 300 12" xmlns="http://www.w3.org/2000/svg">
                          <path d="M 5 10 Q 150 0 295 8" stroke="url(#heroGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ee82ee" />
                              <stop offset="100%" stopColor="#d946ef" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </span>{' '}
                      Agency
                    </>
                  )}
                </>
              ) : (
                <>
                  India's First{' '}
                  <span className="gradient-text">Performance-Driven</span>{' '}
                  Creator{' '}
                  <span className="underline-wrapper">
                    Growth
                    <svg className="svg-underline" viewBox="0 0 300 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 5 10 Q 150 0 295 8" stroke="url(#heroGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ee82ee" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>{' '}
                  Agency
                </>
              )}
            </span>

            <span className="hero-description hero-fade-in delay-3" style={{ display: 'block', marginBottom: '32px', marginTop: '0' }}>
              {apiData?.heroDesc1 || 'We build authority, grow audiences, and engineer virality — so the most ambitious creators in India can scale without the guesswork.'}
            </span>

            <div className="cta-wrapper hero-fade-in delay-4">
              <a href={WA_URL} className="btn-primary" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-whatsapp" />
                Book Strategy Call
              </a>
              <a href="#results" className="btn-secondary">
                View Results <i className="fa-solid fa-arrow-down" />
              </a>
            </div>
          </div>

          {/* ── Founder slider ── */}
          <div
            className="founder-section"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Float cards – Riya */}
            {current === 0 && (
              <>
                <div className="float-card card-stats-riya" style={{ display: 'flex' }}>
                  <div className="stat-icon"><i className="fa-solid fa-users" /></div>
                  <div className="stat-content">
                    <h4>{activeFounders[0]?.badge || apiData?.heroBadge1 || '50K+'}</h4>
                    <p><i className="fa-solid fa-arrow-trend-up" /> {activeFounders[0]?.desc || 'Followers Grown'}</p>
                  </div>
                </div>
                <div className="float-card card-social-riya" style={{ display: 'flex' }}>
                  <div className="social-links">
                    <a href={activeFounders[0]?.instagramId || 'https://www.instagram.com/riyaelity/'} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-instagram" /></a>
                    <a href={activeFounders[0]?.linkedInId || 'https://www.linkedin.com/in/riya-upreti-213a04190/'} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-linkedin" /></a>
                  </div>
                </div>
              </>
            )}

            {/* Float cards – Vibhav */}
            {current === 1 && (
              <>
                <div className="float-card card-stats-vibhav" style={{ display: 'flex' }}>
                  <div className="stat-content">
                    <h4>{activeFounders[1]?.badge || apiData?.heroBadge2 || '100K+'}</h4>
                    <div className="stat-content-text">{activeFounders[1]?.desc ? activeFounders[1].desc.split('\\n').map((l,i)=><span key={i}>{l}<br/></span>) : <>Guaranteed Follower Growth<br />or Full Refund</>}</div>
                  </div>
                </div>
                <div className="float-card card-social-vibhav" style={{ display: 'flex' }}>
                  <div className="social-links">
                    <a href={activeFounders[1]?.instagramId || 'https://www.instagram.com/fobet.media/'} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-instagram" /></a>
                    <a href={activeFounders[1]?.linkedInId || 'https://www.linkedin.com/in/vibhav-raj-175622245/'} target="_blank" rel="noopener noreferrer" className="social-icon"><i className="fa-brands fa-linkedin" /></a>
                  </div>
                </div>
              </>
            )}

            <div className="founder-stage-container">
              <div className="founder-arch" />
              <div className="founder-glow" />
              <div className="founder-slider-wrapper">
                {activeFounders.map((f, i) => (
                  <div key={f.key} className={`founder-slide${current === i ? ' active' : ''}`}>
                    <img src={f.img} alt={f.name} className={f.imgClass} draggable={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="founder-info-container">
              {activeFounders.map((f, i) => (
                <div key={f.key} className={`info-slide${current === i ? ' active' : ''}`}>
                  <div className="founder-label">{f.label} · {apiData?.heroTag || 'Fobet Media'}</div>
                  <div className="founder-name">{f.name}</div>
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
