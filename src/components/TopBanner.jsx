import React, { useRef, useState, useEffect } from 'react';
import './TopBanner.css';
import { FaFacebookF, FaInstagram, FaXTwitter, FaCode, FaMobile, FaArrowRight, FaChevronLeft, FaChevronRight, FaLinkedinIn, FaGithub, FaGlobe } from 'react-icons/fa6';
import { SiGoogleads } from 'react-icons/si';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import { FaMeta } from 'react-icons/fa6';
import { api } from '../services/api';

const renderIcon = (iconName) => {
  switch (iconName) {
    case 'meta': return <FaMeta size={24} color="#1877F2" />;
    case 'google': return <SiGoogleads size={24} color="#F4B400" />;
    case 'web': return <FaCode size={24} color="#8A2BE2" />;
    case 'app': return <FaMobile size={24} color="#4169E1" />;
    case 'code': return <FaCode size={24} color="#8A2BE2" />;
    case 'megaphone': return <HiOutlineSpeakerphone size={24} color="#FF4500" />;
    default: return <FaCode size={24} color="#8A2BE2" />;
  }
};

const renderSocialIcon = (platform) => {
  switch (platform) {
    case 'website': return <FaGlobe />;
    case 'insta': return <FaInstagram />;
    case 'facebook': return <FaFacebookF />;
    case 'twitter': return <FaXTwitter />;
    case 'linkedin': return <FaLinkedinIn />;
    case 'git': return <FaGithub />;
    default: return <FaGlobe />;
  }
};

const TopBanner = () => {
  const [slideIndex, setSlideIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [heroData, setHeroData] = useState(null);
  const [bannerData, setBannerData] = useState(null);
  const [services, setServices] = useState([]);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);

  const startAutoSlide = () => {
    stopAutoSlide();
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => prev + 1);
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (services.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [services]);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const data = await api.getSectionData('hero-section');
        if (data) setHeroData(data);
      } catch (err) {
        console.error("Failed to load hero section data in TopBanner", err);
      }
    };
    loadHero();

    const loadBanner = async () => {
      try {
        const data = await api.getSectionData('top-banner');
        if (data) {
          setBannerData(data);
          if (data.services && data.services.length > 0) {
            setServices(data.services);
          }
        }
      } catch (err) {
        console.error("Failed to load top banner data", err);
      }
    };
    loadBanner();
  }, []);

  const displayServices = services.length > 0 ? [
    services[services.length - 1], // Clone of last item (D)
    ...services,                  // Real items (A, B, C, D)
    services[0]                   // Clone of first item (A)
  ] : [];

  // When transition is disabled for seamless loop reset, turn it back on in next frame
  useEffect(() => {
    if (!transitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [transitionEnabled]);

  const handleNext = () => {
    if (!transitionEnabled || services.length === 0) return;
    stopAutoSlide();
    setSlideIndex((prev) => prev + 1);
    startAutoSlide();
  };

  const handlePrev = () => {
    if (!transitionEnabled || services.length === 0) return;
    stopAutoSlide();
    setSlideIndex((prev) => prev - 1);
    startAutoSlide();
  };

  const handleDotClick = (index) => {
    if (!transitionEnabled || services.length === 0) return;
    stopAutoSlide();
    setSlideIndex(index + 1);
    startAutoSlide();
  };

  const handleTransitionEnd = () => {
    if (services.length === 0) return;
    if (slideIndex === displayServices.length - 1) {
      // Landed on clone of A at the end, instantly reset to real A
      setTransitionEnabled(false);
      setSlideIndex(1);
    } else if (slideIndex === 0) {
      // Landed on clone of D at the start, instantly reset to real D
      setTransitionEnabled(false);
      setSlideIndex(services.length);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  const handleCtaClick = (title) => {
    const phone = heroData?.whatsappNumber ? heroData.whatsappNumber.replace(/\D/g, '') : '917020061418';
    const message = encodeURIComponent(`Hi, I want to know about your ${title} service. Please share details.`);
    const waUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  if (services.length === 0 && !bannerData) {
    return null; // or a loader
  }

  const activeIndex = services.length > 0 ? (slideIndex - 1 + services.length) % services.length : 0;

  return (
    <div className="top-banner-wrapper">
      {/* Top Bar with Socials and Announcement */}
      <div className="top-bar-container">
        <div className="announcement-pill">
          <div className="announcement-label">
            <HiOutlineSpeakerphone className="speaker-icon" />
            <span>LATEST UPDATE</span>
          </div>
          <div className="announcement-divider"></div>
          <div className="announcement-marquee">
            <div className="marquee-content">
              {bannerData?.announcementText || "We help brands grow with transparency, strategy & results that speak. • Trusted by 50+ businesses worldwide."}
            </div>
          </div>
        </div>

        <div className="social-icons">
          {bannerData?.socials?.map((social, index) => (
            <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label={social.platform}>
              {renderSocialIcon(social.platform)}
            </a>
          ))}
        </div>
      </div>

      {/* Main Services Section */}
      <div className="services-section">
        {/* Background decoration elements */}
        <div className="section-bg-dots"></div>
        <div className="section-bg-orb orb-1"></div>
        <div className="section-bg-orb orb-2"></div>
        <div className="section-bg-marketing icon-1">📈</div>
        <div className="section-bg-marketing icon-2">🎯</div>
        <div className="section-bg-marketing icon-3">🚀</div>

        <div className="services-header">
          <div className="services-title-area">
            <span className="subtitle">{bannerData?.subtitle || "WHAT WE DO"}</span>
            <h2>
              {bannerData?.title1 ? (
                bannerData.title1.split('\\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== bannerData.title1.split('\\n').length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <>Solutions That<br />Drive </>
              )}
              {bannerData?.titleHighlight && <span className="highlight"> {bannerData.titleHighlight}</span>}
            </h2>
          </div>
          <div className="services-nav">
            <button className="nav-btn" onClick={handlePrev} aria-label="Scroll Left"><FaChevronLeft /></button>
            <button className="nav-btn" onClick={handleNext} aria-label="Scroll Right"><FaChevronRight /></button>
          </div>
        </div>

        {services.length > 0 && (
          <>
            <div 
              className="services-slider-container"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="services-slider-track"
                onTransitionEnd={handleTransitionEnd}
                style={{ 
                  transform: `translateX(calc(-${slideIndex} * (var(--card-width) + var(--card-gap))))`,
                  transition: transitionEnabled ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                }}
              >
                <div className="services-slider">
                  {displayServices.map((service, index) => (
                    <div 
                      className={`service-card ${activeIndex === (index - 1 + services.length) % services.length && slideIndex === index ? 'active-card' : 'inactive-card'}`} 
                      key={`${service._id || service.id}-${index}`}
                      style={{ backgroundImage: `url(${service.bgImage})` }}
                    >
                      <div className="service-card-overlay"></div>
                      <div className="service-card-content">
                        <div className="service-card-header">
                          <div className={`service-icon-wrapper icon-${service.iconName}`}>
                            {renderIcon(service.iconName)}
                          </div>
                          <span className="service-card-subtitle">{service.subtitle}</span>
                        </div>
                        <h3 className="service-card-title">{service.title}</h3>
                        <p className="service-card-desc">{service.description}</p>
                        <button 
                          className="service-cta-btn"
                          onClick={() => handleCtaClick(service.title)}
                        >
                          <span>{service.ctaText}</span>
                          <FaArrowRight className="cta-arrow" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="services-pagination">
              {services.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBanner;
