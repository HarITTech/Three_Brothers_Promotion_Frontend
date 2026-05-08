import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PackagesSection.css';

const WA_MENTOR = 'https://wa.me/919128006318?text=Hi%2C%20I%20would%20like%20to%20book%20a%201%3A1%20Mentorship%20Session%20with%20Vibhav%20Raj.';
const WA_CREATOR = 'https://wa.me/919128006318?text=Hi%2C%20I%27m%20interested%20in%20the%20Complete%20Creator%20Growth%20package.';

export default function PackagesSection() {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSectionData('packages-section');
      if (data) setApiData(data);
    };
    loadData();
  }, []);

  const hasDynamicPackages = apiData?.packData?.length > 0;

  return (
    <div className="packages-section-wrapper" id="packages">
      <section className="packages-section">
        <div className="packages-glow glow-center" />

        <div className="packages-header">
          <div className="packages-badge">{apiData?.packTag || 'PRICING PLANS'}</div>
          <h2 className="packages-title">
            {apiData?.heading1 ? (
              <>
                {apiData.heading1} <span className="gradient-text">{apiData.heading2}</span>
              </>
            ) : (
              <>
                Our <span className="gradient-text">Packages</span>
              </>
            )}
          </h2>
          <p className="packages-desc">{apiData?.desc || 'Choose the package that fits your growth stage'}</p>
        </div>

        <div className="packages-row">
          {hasDynamicPackages ? (
            apiData.packData.map((p, i) => (
              <div key={i} className={`package-card ${p.badge ? 'featured' : ''}`}>
                {p.badge && <div className="package-tag tag-popular">{p.badge}</div>}
                <div className="package-name">{p.heading}</div>
                <div className="package-price">
                  {p.price.split('/').map((part, pi) => (
                    pi === 0 ? part : <span key={pi}>/{part}</span>
                  ))}
                </div>
                <p className="package-desc">{p.desc}</p>
                <div className="package-line" />

                {p.guaranteeTitle && (
                  <div className="guarantee-box">
                    <div className="guarantee-title"><i className="fa-solid fa-shield-check" /> {p.guaranteeTitle}</div>
                    <div className="guarantee-text">{p.guaranteeText}</div>
                  </div>
                )}

                {p.tag1 && <div className="highlight-text">{p.tag1}</div>}
                <ul className="package-features">
                  {(p.points || []).map((feat, fi) => (
                    <li key={fi}><i className="fa-solid fa-check" />
                      <span dangerouslySetInnerHTML={{ __html: feat }} />
                    </li>
                  ))}
                </ul>
                {p.tag2 && (
                  <div className="highlight-text" style={{ marginTop: 'auto' }}>
                    <span dangerouslySetInnerHTML={{ __html: p.tag2.replace(/\\n/g, '<br/>') }} />
                  </div>
                )}
                <a href={p.heading.toLowerCase().includes('mentorship') ? WA_MENTOR : WA_CREATOR} target="_blank" rel="noopener noreferrer" className={`package-btn ${p.badge ? 'btn-filled' : 'btn-outline'}`}>
                  {p.btnName || 'Get Started'}
                </a>
              </div>
            ))
          ) : (
            <>
              {/* Card 1: 1:1 Mentorship */}
              <div className="package-card">
                <div className="package-name">1:1 Mentorship Session</div>
                <div className="package-price">₹45,000</div>
                <p className="package-desc">A direct clarity session to fix your brand direction.</p>
                <div className="package-line" />
                <div className="highlight-text">with Vibhav Raj</div>
                <ul className="package-features">
                  <li><i className="fa-solid fa-check" />Brand positioning: who you are &amp; how people should see you</li>
                  <li><i className="fa-solid fa-check" />Clear content pillars &amp; storytelling style</li>
                  <li><i className="fa-solid fa-check" />Exact audience &amp; niche clarity</li>
                  <li><i className="fa-solid fa-check" />6-month growth roadmap</li>
                  <li><i className="fa-solid fa-check" />Script &amp; hook structuring</li>
                  <li><i className="fa-solid fa-check" />Shoot style, what to avoid, on-camera guidance</li>
                  <li><i className="fa-solid fa-check" />Page audit: what's working vs what's blocking growth</li>
                  <li><i className="fa-solid fa-check" />Monetisation plan: brand deals, courses, consulting</li>
                </ul>
                <div className="highlight-text" style={{ marginTop: 'auto' }}>A personalised blueprint for YOUR growth.</div>
                <a href={WA_MENTOR} target="_blank" rel="noopener noreferrer" className="package-btn btn-outline">Get Started</a>
              </div>

              {/* Card 2: Complete Creator Growth (featured) */}
              <div className="package-card featured">
                <div className="package-tag tag-popular">Most Popular</div>
                <div className="package-name">Complete Creator Growth</div>
                <div className="package-price">₹4,00,000<span>/month</span></div>
                <p className="package-desc">Done-for-you creator growth. You just show up.</p>
                <div className="package-line" />

                <div className="guarantee-box">
                  <div className="guarantee-title"><i className="fa-solid fa-shield-check" /> Full Refund Guarantee</div>
                  <div className="guarantee-text">Minimum guarantee included — miss the agreed goals, get a full refund.</div>
                </div>

                <div className="highlight-text">We handle:</div>
                <ul className="package-features">
                  <li><i className="fa-solid fa-check" /><strong>Strategy</strong></li>
                  <li><i className="fa-solid fa-check" /><strong>Scripting</strong></li>
                  <li><i className="fa-solid fa-check" /><strong>Shooting</strong></li>
                  <li><i className="fa-solid fa-check" /><strong>Editing</strong></li>
                  <li><i className="fa-solid fa-check" /><strong>Posting</strong></li>
                </ul>
                <div className="highlight-text" style={{ marginTop: 'auto' }}>
                  Scaled multiple creators in this category<br />The fastest path to becoming a known creator.
                </div>
                <a href={WA_CREATOR} target="_blank" rel="noopener noreferrer" className="package-btn btn-filled">Get Started</a>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
