import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import './TestimonialsSection.css';

const VIDEOS = [
  { src: '/src/assets/videos/4.mp4', handle: '@rajneeshupreti', href: 'https://www.instagram.com/rajneeshupreti' },
  { src: '/src/assets/videos/1.mp4', handle: '@mazedarfinance', href: 'https://www.instagram.com/mazedarfinance' },
  { src: '/src/assets/videos/2.mp4', handle: '@abhy.advisory', href: 'https://www.instagram.com/abhy.advisory' },
  { src: '/src/assets/videos/3.mp4', handle: '@rahul.careers', href: 'https://www.instagram.com/rahul.careers' },
  { src: '/src/assets/videos/5.mp4', handle: '@muskanarrates', href: 'https://www.instagram.com/muskanarrates' },
  { src: '/src/assets/videos/6.mp4', handle: '@astrologerdivapratihast', href: 'https://www.instagram.com/astrologerdivapratihast' },
  { src: '/src/assets/videos/7.mp4', handle: '@namastro.app', href: 'https://www.instagram.com/namastro.app' },
];

function VideoCard({ src, handle, href }) {
  return (
    <div className="video-card">
      <div className="video-wrapper">
        <video controls preload="metadata">
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <a href={href} target="_blank" rel="noopener noreferrer" className="video-handle">{handle}</a>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = useRef(0);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('clients-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const activeVideos = apiData?.video?.length > 0
    ? apiData.video.map((v) => ({
        src: v.link,
        handle: v.badge,
        href: v.link // default href to the link if they don't have a separate profile URL
      }))
    : VIDEOS;

  const prevSlide = () => setMobileIndex((i) => Math.max(i - 1, 0));
  const nextSlide = () => setMobileIndex((i) => Math.min(i + 1, activeVideos.length - 1));

  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX.current;
    if (dx < -50) nextSlide();
    else if (dx > 50) prevSlide();
  };

  const trackOffset = () => {
    const cardW = 280;
    const gap = 20;
    return -(mobileIndex * (cardW + gap));
  };

  return (
    <section className="testimonials-section">
      <div className="bg-grid-wrap">
        <div className="bg-grid" />
        <div className="bg-glow-spot" />
      </div>

      <div className="testimonials-header">
        <div className="testimonials-badge">{apiData?.cliTag || 'CLIENT LOVE'}</div>
        <h2 className="testimonials-title">
          {apiData?.heading1 ? (
            <>
              {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
            </>
          ) : (
            <>
              What Our <span className="gradient-text">Clients Say</span>
            </>
          )}
        </h2>
        <p className="testimonials-desc">{apiData?.desc || 'Real results from creators and brands just like you.'}</p>
      </div>

      {/* Desktop grid */}
      <div className="videos-grid">
        {activeVideos.map((v, i) => <VideoCard key={i} {...v} />)}
      </div>

      {/* Mobile slider */}
      <div className="mobile-slider-container">
        <div className="mobile-slider-wrapper">
          <button className="mobile-nav-btn mobile-nav-left" id="mobilePrev" onClick={prevSlide} aria-label="Previous">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button className="mobile-nav-btn mobile-nav-right" id="mobileNext" onClick={nextSlide} aria-label="Next">
            <i className="fa-solid fa-chevron-right" />
          </button>
          <div
            className="mobile-slider-track"
            id="mobileTrack"
            style={{ transform: `translateX(${trackOffset()}px)` }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {activeVideos.map((v, i) => <VideoCard key={i} {...v} />)}
          </div>
        </div>
      </div>

      <p className="many-more-text-t">
        {apiData?.endText ? (
          <>
            <span className="gradient-text">&amp;</span> {apiData.endText}
          </>
        ) : (
          <>
            <span className="gradient-text">&amp;</span> Many more
          </>
        )}
      </p>
    </section>
  );
}
