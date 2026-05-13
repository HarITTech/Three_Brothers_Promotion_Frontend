import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import Skeleton from './Skeleton';
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

const getVideoType = (url) => {
  if (!url) return { type: 'unknown' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let id = '';
    if (url.includes('shorts/')) {
      id = url.split('shorts/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      id = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
  }
  if (url.includes('instagram.com')) {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return { type: 'instagram', embedUrl: `${cleanUrl}/embed` };
  }
  return { type: 'direct' };
};

function VideoCard({ src, handle, loading }) {
  if (loading) {
    return (
      <div className="video-card">
        <div className="video-wrapper">
          <Skeleton type="rect" height="400px" />
          <div className="video-handle">
            <Skeleton width="80px" height="1em" />
          </div>
        </div>
      </div>
    );
  }

  const videoInfo = getVideoType(src);
  const isSocial = videoInfo.type === 'youtube' || videoInfo.type === 'instagram';

  const handleBadgeClick = (e) => {
    if (!isSocial) {
      e.preventDefault(); // Stay here if not social
    }
  };

  return (
    <div className="video-card">
      <div className="video-wrapper">
        {videoInfo.type === 'youtube' || videoInfo.type === 'instagram' ? (
          <iframe
            src={videoInfo.embedUrl}
            className="video-embed-frame"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={handle}
          ></iframe>
        ) : (
          <video controls preload="metadata">
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <a 
          href={src} 
          target={isSocial ? "_blank" : "_self"} 
          rel="noopener noreferrer" 
          className="video-handle"
          onClick={handleBadgeClick}
        >
          {handle}
        </a>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchStartX = useRef(0);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getSectionData('clients-section');
        if (data) setApiData(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeVideos = apiData?.video?.length > 0
    ? apiData.video.map((v) => ({
        src: v.link,
        handle: v.badge,
        href: v.link // default href to the link if they don't have a separate profile URL
      }))
    : (loading ? [] : VIDEOS);

  const prevSlide = () => setMobileIndex((i) => Math.max(i - 1, 0));
  const nextSlide = () => setMobileIndex((i) => Math.min(i + 1, activeVideos.length - 1));

  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const onTouchEnd = (e) => {
    if (activeVideos.length === 0) return;
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
        <div className="testimonials-badge">
          {loading ? <Skeleton width="120px" height="1em" /> : (apiData?.cliTag || 'CLIENT LOVE')}
        </div>
        <h2 className="testimonials-title">
          {loading ? (
            <Skeleton width="60%" height="1.5em" />
          ) : apiData?.heading1 ? (
            <>
              {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
            </>
          ) : (
            <>
              What Our <span className="gradient-text">Clients Say</span>
            </>
          )}
        </h2>
        <p className="testimonials-desc">
          {loading ? <Skeleton width="80%" /> : (apiData?.desc || 'Real results from creators and brands just like you.')}
        </p>
      </div>

      {/* Desktop grid */}
      <div className="videos-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => <VideoCard key={i} loading={true} />)
        ) : activeVideos.map((v, i) => <VideoCard key={i} {...v} />)}
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
            {loading ? (
              Array(3).fill(0).map((_, i) => <VideoCard key={i} loading={true} />)
            ) : activeVideos.map((v, i) => <VideoCard key={i} {...v} />)}
          </div>
        </div>
      </div>

      <p className="many-more-text-t">
        {loading ? (
          <Skeleton width="150px" height="1em" />
        ) : apiData?.endText ? (
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
