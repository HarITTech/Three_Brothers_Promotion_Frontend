import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ResultsSection.css';

// Import result images
import r1 from '../assets/images/results/2-3.png';
import r2 from '../assets/images/results/3-2.png';
import r3 from '../assets/images/results/4-2.png';
import r4 from '../assets/images/results/5-2.png';
import r5 from '../assets/images/results/6-2.png';
import r6 from '../assets/images/results/7-2.png';
import r7 from '../assets/images/results/8-2.png';
import r8 from '../assets/images/results/9-1.png';
import r9 from '../assets/images/results/10-1.png';
import r10 from '../assets/images/results/12-1.png';
import r11 from '../assets/images/results/13-1.png';

const CARDS = [
  { img: r1, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: 'https://www.instagram.com/rajneeshupreti' },
  { img: r2, tag: 'Starting from 0', tagClass: 'tag-starting', href: 'https://www.instagram.com/mazedarfinance' },
  { img: r3, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: 'https://www.instagram.com/abhy.advisory' },
  { img: r4, tag: 'Starting from 0', tagClass: 'tag-starting', href: 'https://www.instagram.com/rahul.careers' },
  { img: r5, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: 'https://www.instagram.com/muskanarrates' },
  { img: r6, tag: 'Starting from 0', tagClass: 'tag-starting', href: 'https://www.instagram.com/astrologerdivapratihast' },
  { img: r7, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: 'https://www.instagram.com/namastro.app' },
  { img: r8, tag: 'Starting from 0', tagClass: 'tag-starting', href: '#' },
  { img: r9, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: '#' },
  { img: r10, tag: 'Starting from 0', tagClass: 'tag-starting', href: '#' },
  { img: r11, tag: '0 → 100K in 6 months', tagClass: 'tag-months', href: '#' },
];

export default function ResultsSection() {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('result-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const activeCards = apiData?.clients?.length > 0 
    ? apiData.clients.map((c, i) => ({
        img: c.image,
        tag: c.name,
        tagClass: i % 2 === 0 ? 'tag-months' : 'tag-starting',
        href: c.instagramId || '#'
      }))
    : CARDS;

  return (
    <div className="fobet-results-wrapper" id="results">
      <section className="results-section">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <i className="fa-solid fa-star sparkle" />
        <i className="fa-solid fa-star sparkle" />
        <i className="fa-solid fa-star sparkle" />
        <i className="fa-solid fa-star sparkle" />

        <div className="results-badge">{apiData?.resultTag || 'PROVEN RESULTS'}</div>
        <h2 className="results-title">
          {apiData?.heading1 ? (
            <>
              {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
            </>
          ) : (
            <>
              Client <span className="gradient-text">Transformation Results</span>
            </>
          )}
        </h2>
        <p className="results-subtext">
          {apiData?.desc || "We work with business owners, entrepreneurs and professionals"}
        </p>

        <div className="results-grid">
          {activeCards.map((c, i) => (
            <a
              key={i}
              href={c.href}
              className="result-card"
              target={c.href !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              <div className="result-static">
                <img src={c.img} alt={`Result ${i + 1}`} className="result-static-img" loading="lazy" />
                <div className={`card-tag ${c.tagClass}`}>{c.tag}</div>
              </div>
            </a>
          ))}
        </div>

        <p className="many-more-text">
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
    </div>
  );
}
