import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './StatsSection.css';

export default function StatsSection() {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('stat-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  return (
    <section className="two-day-section" id="stats">
      <div className="glow-spot glow-left" />
      <div className="glow-spot glow-right" />

      <div className="stats-container">
        <div className="text-content">
          <div className="stats-highlight-box">
            <i className="fa-solid fa-bolt" />
            {apiData?.statTag || 'The Fobet Advantage'}
          </div>
          <h2>
            {apiData?.heading ? (
              apiData.heading.split('Zero to Icon').length > 1 ? (
                <>
                  {apiData.heading.split('Zero to Icon')[0]}
                  <span style={{ background: 'var(--grad-brand-ext)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Zero to Icon</span>
                  {apiData.heading.split('Zero to Icon')[1]}
                </>
              ) : (
                apiData.heading
              )
            ) : (
              <>
                From <span style={{ background: 'var(--grad-brand-ext)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Zero to Icon</span> in Months
              </>
            )}
          </h2>
          <p className="sub-heading">
            {apiData?.desc ? (
              apiData.desc
            ) : (
              <>
                <strong>No guesswork. No generic content.</strong> Pure, data-driven personal branding that gets results — with a money-back guarantee.
              </>
            )}
          </p>
        </div>

        <div className="stats-deck">
          {/* Left stat card */}
          <div className="glass-card stat-card-side purple">
            <div className="stat-value">{apiData?.card1?.field1 || '50'}<span style={{ fontSize: '22px', opacity: 0.7 }}>{apiData?.card1?.field1 ? '' : '+'}</span></div>
            <div className="stat-label">{apiData?.card1?.field2 || 'Creators Scaled'}</div>
            <i className="fa-solid fa-users icon-float" style={{ color: 'var(--brand-purple)', opacity: 0.5 }} />
            <svg className="sparkline" viewBox="0 0 120 50">
              <path d="M5,40 L20,30 L40,35 L60,15 L80,20 L100,5 L115,10" stroke="var(--brand-purple)" />
            </svg>
          </div>

          {/* Center progress ring */}
          <div className="glass-card stat-card-center">
            <div className="progress-ring">
              <div className="stat-text-center">
                <h3>{apiData?.card2?.field1 || '100K'}</h3>
                <p>{apiData?.card2?.field2 || 'Guaranteed'}</p>
              </div>
            </div>
          </div>

          {/* Right stat card */}
          <div className="glass-card stat-card-side blue">
            <div className="stat-value">{apiData?.card3?.field1 || '6'}<span style={{ fontSize: '22px', opacity: 0.7 }}>{apiData?.card3?.field1 ? '' : 'mo'}</span></div>
            <div className="stat-label">{apiData?.card3?.field2 || 'Avg. Months to 100K'}</div>
            <i className="fa-solid fa-calendar icon-float" style={{ color: 'var(--accent-cyan)', opacity: 0.5 }} />
            <svg className="sparkline" viewBox="0 0 120 50">
              <path d="M5,45 L25,35 L45,30 L65,20 L85,15 L105,8 L115,5" stroke="var(--accent-cyan)" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
