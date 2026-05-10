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
            <i className={apiData?.statIcon || "fa-solid fa-rocket"} /> &nbsp;
            {apiData?.statTag || 'Done for you services'}
          </div>
          <h2>
            {apiData?.heading || 'Just 2 Days In A Month'}
          </h2>
          <p className="sub-heading">
            {apiData?.subHeading1 || 'for creating impactful personal brands'}
          </p>
          <p className="sub-heading" style={{ marginTop: '15px' }}>
            {apiData?.subHeading2 ? (
              <strong>{apiData.subHeading2}</strong>
            ) : (
              <strong>Generate Revenue, Increase Followers, Gain Massive Reach</strong>
            )}
          </p>
        </div>

        <div className="stats-deck">
          {/* Card 1: Revenue */}
          <div className="glass-card stat-card-side purple">
            <div>
              <h4 className="stat-value">{apiData?.card1?.field1 || '10M+'}</h4>
              <p className="stat-label">{apiData?.card1?.field2 || 'Revenue Generated'}</p>
            </div>
            <i className={`${apiData?.card1?.field3 || 'fa-solid fa-dollar-sign'} icon-float`} style={{ color: '#fbbf24' }} />
            <svg className="sparkline" viewBox="0 0 100 40">
              <path d="M0 30 Q 20 25 40 10 T 80 15 T 100 5" stroke="#c084fc" />
            </svg>
          </div>

          {/* Card 2: Followers (Center Hero) */}
          <div className="glass-card stat-card-center">
            <div className="progress-ring">
              <div className="stat-text-center">
                <h3>{apiData?.card2?.field1 || '50M+'}</h3>
                <p>{apiData?.card2?.field2 || 'Followers'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Views */}
          <div className="glass-card stat-card-side blue">
            <div>
              <h4 className="stat-value">{apiData?.card3?.field1 || '500M+'}</h4>
              <p className="stat-label">{apiData?.card3?.field2 || 'Views Generated'}</p>
            </div>
            <i className={`${apiData?.card3?.field3 || 'fa-solid fa-eye'} icon-float`} style={{ color: '#22d3ee' }} />
            <svg className="sparkline" viewBox="0 0 100 40">
              <path d="M0 35 Q 25 30 50 15 T 100 10" stroke="#22d3ee" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
