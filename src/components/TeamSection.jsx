import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Skeleton from './Skeleton';
import './TeamSection.css';
import riya from '../assets/images/riya.jpg';
import vibhav from '../assets/images/vibhav.jpg';

const FOUNDERS = [
  {
    img: riya,
    alt: 'Riya Upreti',
    badges: [
      { label: 'FOUNDER', cls: 'role-badge' },
      { label: 'Personal Branding Expert', cls: 'role-badge expert-badge' },
    ],
    name: 'Riya Upreti',
    bio: <>The creative force. Riya understands <span className="bio-highlight">audience psychology</span> better than anyone. She bridges the gap between raw emotion and strategic content.</>,
    links: [
      { href: 'https://www.instagram.com/riyaelity/', cls: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
      { href: 'https://www.linkedin.com/in/riya-upreti-213a04190/', cls: 'linkedin', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
    ],
  },
  {
    img: vibhav,
    alt: 'Vibhav Raj',
    badges: [
      { label: 'CO-FOUNDER', cls: 'role-badge co-founder-badge' },
      { label: 'Personal Branding Expert', cls: 'role-badge expert-badge' },
    ],
    name: 'Vibhav Raj',
    bio: <>The strategist. Founder of <span className="bio-highlight">LastRaven</span> and an engineering grad, Vibhav treats virality as a science to be engineered, not guessed.</>,
    links: [
      { href: 'https://www.instagram.com/fobet.media/', cls: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
      { href: 'https://www.linkedin.com/in/vibhav-raj-175622245/', cls: 'linkedin', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
    ],
  },
];

export default function TeamSection() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getSectionData('hero-section');
        if (data) setApiData(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Show ALL members (admins + team members) in the Team Section
  const teamMembers = apiData?.teamMember?.length > 0 ? apiData.teamMember.map(m => {
    const links = [];
    if (m.instagramId) {
      links.push({ href: m.instagramId, cls: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' });
    }
    if (m.linkedInId) {
      links.push({ href: m.linkedInId, cls: 'linkedin', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' });
    }
    
    const badges = [];
    if (m.role) {
      badges.push({ label: m.role, cls: 'role-badge' });
    }
    if (m.badge) {
      badges.push({ label: m.badge, cls: 'role-badge expert-badge' });
    }

    return {
      img: m.image,
      alt: m.name,
      badges: badges,
      name: m.name,
      bio: m.desc || '',
      links: links
    };
  }) : (loading ? [] : FOUNDERS);

  return (
    <div className="about-section-wrapper" id="team">
      <section className="about-team-section">
        <div className="team-bg-grid-wrap">
          <div className="team-bg-grid" />
          <div className="team-bg-glow-spot" />
        </div>

        <div className="about-header">
          <div className="team-badge">MEET THE MINDS</div>
          <h2 className="about-team-title">
            Our <span className="gradient-text">Leadership</span>
          </h2>
          <p className="about-team-subtitle">
            Strategy, creativity, and execution. We are the team behind the screens.
          </p>
        </div>

        <div className="team-container">
          <div className="founders-row">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="member-card founder-card">
                  <div className="avatar-wrapper">
                    <Skeleton type="circle" width="150px" height="150px" />
                  </div>
                  <div className="badges-row">
                    <Skeleton width="80px" height="1.5em" />
                    <Skeleton width="120px" height="1.5em" />
                  </div>
                  <Skeleton width="150px" height="1.5em" style={{ marginTop: '15px' }} />
                  <Skeleton type="text" width="90%" style={{ marginTop: '10px' }} />
                  <Skeleton type="text" width="80%" />
                  <div className="social-links-team">
                    <Skeleton width="100px" height="2.5em" />
                    <Skeleton width="100px" height="2.5em" />
                  </div>
                </div>
              ))
            ) : teamMembers.map((f, i) => (
              <div key={f.name || i} className="member-card founder-card">
                <div className="avatar-wrapper">
                  <div className="founder-ring" />
                  <img src={f.img || riya} alt={f.alt} className="avatar-img" decoding="async" />
                </div>
                <div className="badges-row">
                  {f.badges.map((b) => (
                    <span key={b.label} className={b.cls}>{b.label}</span>
                  ))}
                </div>
                <h3 className="member-name">{f.name}</h3>
                <div className="member-bio" dangerouslySetInnerHTML={{ __html: f.bio || '' }} />
                <div className="social-links-team">
                  {f.links.map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`social-btn ${l.cls}`}>
                      <i className={l.icon} /> {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
