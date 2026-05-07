import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import './ProtocolSection.css';

import p1 from '../assets/images/protocol/01.jpg';
import p2 from '../assets/images/protocol/02.jpg';
import p3 from '../assets/images/protocol/03.jpg';
import p4 from '../assets/images/protocol/04.jpg';
import p5 from '../assets/images/protocol/05.jpg';
import p6 from '../assets/images/protocol/06.jpg';

const STEPS = [
  { icon: 'fa-solid fa-magnifying-glass', title: 'Deep-Dive Discovery', img: p1, desc: 'We analyze your niche, competitors, and target audience to uncover your unique angle and positioning strategy.' },
  { icon: 'fa-solid fa-pen-nib', title: 'Script & Content Planning', img: p2, desc: 'Our team crafts 25–30 targeted scripts per month, optimized for hooks, retention, and your audience psychology.' },
  { icon: 'fa-solid fa-clapperboard', title: 'Studio Shoot Days', img: p3, desc: 'Just 2 days a month in our studio. We direct, prompt, and shoot everything — you just show up and be yourself.' },
  { icon: 'fa-solid fa-wand-magic-sparkles', title: 'Pro Editing & Post', img: p4, desc: 'High-retention editing with captions, sound design, B-roll, and platform-specific formatting for maximum reach.' },
  { icon: 'fa-solid fa-chart-line', title: 'Strategy & Optimization', img: p5, desc: 'Weekly analytics review, trend monitoring, and algorithm adaptation keeps your content performing at peak levels.' },
  { icon: 'fa-solid fa-rocket', title: 'Scale to 100K & Beyond', img: p6, desc: 'With our guaranteed framework, you hit 100K followers in 6 months — or we work free until you do.' },
];

export default function ProtocolSection() {
  const containerRef = useRef(null);
  const fillRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('protocol-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const activeSteps = apiData?.protocol?.length > 0
    ? apiData.protocol.map((p) => ({
        icon: p.icon || 'fa-solid fa-circle-check',
        title: p.heading,
        img: p.image,
        desc: p.desc
      }))
    : STEPS;

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      const fill = fillRef.current;
      if (!container || !fill) return;

      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(
        Math.max((windowH - rect.top) / (rect.height - windowH), 0),
        1
      );
      fill.style.height = `${progress * 100}%`;

      const items = container.querySelectorAll('.timeline-item');
      let newActive = -1;
      items.forEach((item, i) => {
        const ir = item.getBoundingClientRect();
        if (ir.top < windowH * 0.65) newActive = i;
      });
      setActiveIdx(newActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSteps.length]);

  return (
    <section className="timeline-section" id="protocol">
      <div className="timeline-glow glow-top-left" />
      <div className="timeline-glow glow-bottom-right" />

      <div className="timeline-header">
        <div className="timeline-badge">{apiData?.protocolTag || 'THE FOBET PROTOCOL'}</div>
        <h2 className="timeline-title">
          {apiData?.heading1 ? (
            <>
              {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
            </>
          ) : (
            <>
              Our <span className="gradient-text">6-Step</span> Growth Framework
            </>
          )}
        </h2>
        <p className="timeline-desc">
          {apiData?.desc || 'A battle-tested system that transforms everyday people into powerful personal brands.'}
        </p>
      </div>

      <div className="timeline-container" ref={containerRef}>
        <div className="timeline-line-bg" />
        <div className="timeline-line-fill" ref={fillRef} />

        {activeSteps.map((step, i) => (
          <div key={i} className={`timeline-item${activeIdx >= i ? ' active' : ''}`}>
            {/* Odd → content left, image right */}
            {i % 2 === 0 ? (
              <>
                <div className="timeline-content-side">
                  <div className="glass-card-tl">
                    <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="step-details">
                      <div className="step-icon"><i className={step.icon} /></div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="timeline-dot" />
                <div className="timeline-empty-side">
                  <div className="timeline-image-card">
                    <img src={step.img} alt={step.title} loading="lazy" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="timeline-empty-side">
                  <div className="timeline-image-card">
                    <img src={step.img} alt={step.title} loading="lazy" />
                  </div>
                </div>
                <div className="timeline-dot" />
                <div className="timeline-content-side">
                  <div className="glass-card-tl">
                    <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="step-details">
                      <div className="step-icon"><i className={step.icon} /></div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
