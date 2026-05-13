import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    team: 0,
    faqs: 0,
    results: 0,
    protocols: 0,
    packages: 0,
    videos: 0
  });
  const [latency, setLatency] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastSection, setLastSection] = useState('');

  useEffect(() => {
    const fetchAllCounts = async () => {
      const startTime = performance.now();
      try {
        const [hero, faqs, results, protocol, packages, clients, contact] = await Promise.all([
          api.getSectionData('hero-section'),
          api.getSectionData('faqs-section'),
          api.getSectionData('result-section'),
          api.getSectionData('protocol-section'),
          api.getSectionData('packages-section'),
          api.getSectionData('clients-section'),
          api.getSectionData('contact-section')
        ]);
        const endTime = performance.now();
        setLatency(Math.round(endTime - startTime));

        setCounts({
          team: hero?.teamMember?.length || 0,
          faqs: faqs?.faqData?.length || 0,
          results: results?.clients?.length || 0,
          protocols: protocol?.protocol?.length || 0,
          packages: packages?.packData?.length || 0,
          videos: clients?.video?.length || 0,
          contactStatus: contact ? 'Configured' : 'Missing'
        });

        // Find latest update
        const allSections = [
          { name: 'Hero', data: hero },
          { name: 'FAQs', data: faqs },
          { name: 'Portfolio', data: results },
          { name: 'Protocol', data: protocol },
          { name: 'Pricing', data: packages },
          { name: 'Video Leads', data: clients },
          { name: 'Contact', data: contact }
        ];

        let latest = null;
        let latestName = '';

        allSections.forEach(s => {
          if (s.data?.updatedAt) {
            const date = new Date(s.data.updatedAt);
            if (!latest || date > latest) {
              latest = date;
              latestName = s.name;
            }
          }
        });

        if (latest) {
          setLastUpdate(latest.toLocaleString());
          setLastSection(latestName);
        }

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCounts();
  }, []);

  const stats = [
    { label: 'Team Members', value: counts.team, icon: 'fa-users', color: '#6366f1', trend: 'Content' },
    { label: 'Active FAQs', value: counts.faqs, icon: 'fa-circle-question', color: '#10b981', trend: 'Support' },
    { label: 'Client Results', value: counts.results, icon: 'fa-briefcase', color: '#f59e0b', trend: 'Portfolio' },
    { label: 'Video Leads', value: counts.videos, icon: 'fa-video', color: '#ef4444', trend: 'Media' },
  ];

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Dashboard Overview</h1>
            <p>Monitor and manage your digital presence from one central hub.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              fontSize: '0.8rem', 
              fontWeight: '700',
              border: '1px solid #d1fae5'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              SYSTEM LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} className="admin-card" style={{ marginBottom: 0, padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  backgroundColor: `${stat.color}10`, 
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: `1px solid ${stat.color}20`
                }}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.trend}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-sub)', fontWeight: '500', marginBottom: '4px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--admin-text-main)', margin: 0 }}>{stat.value}</h3>
            </div>
            {/* Background Decorative Element */}
            <div style={{ 
              position: 'absolute', 
              right: '-10px', 
              bottom: '-10px', 
              fontSize: '5rem', 
              color: `${stat.color}05`, 
              transform: 'rotate(-15deg)',
              zIndex: 1
            }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Quick Navigation Section */}
        <div>
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-bolt-lightning" style={{ color: '#f59e0b' }}></i>
                <span>Quick Actions</span>
              </div>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Link to="/tbp-admin/hero-section" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '14px' }}>
                  <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--admin-primary)' }}></i>
                  <div style={{ textAlign: 'left', marginLeft: '10px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Edit Hero</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', fontWeight: 'normal' }}>Main landing content</div>
                  </div>
                </Link>
                <Link to="/tbp-admin/faqs-section" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '14px' }}>
                  <i className="fa-solid fa-plus" style={{ color: 'var(--admin-success)' }}></i>
                  <div style={{ textAlign: 'left', marginLeft: '10px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Add FAQ</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', fontWeight: 'normal' }}>New support question</div>
                  </div>
                </Link>
                <Link to="/tbp-admin/result-section" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '14px' }}>
                  <i className="fa-solid fa-briefcase" style={{ color: '#3b82f6' }}></i>
                  <div style={{ textAlign: 'left', marginLeft: '10px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>New Client Result</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', fontWeight: 'normal' }}>Showcase success</div>
                  </div>
                </Link>
                <Link to="/tbp-admin/team-section" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '14px' }}>
                  <i className="fa-solid fa-user-plus" style={{ color: '#6366f1' }}></i>
                  <div style={{ textAlign: 'left', marginLeft: '10px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Add Member</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', fontWeight: 'normal' }}>Grow your team</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: 'var(--admin-primary)' }}></i>
                <span>Management Overview</span>
              </div>
            </div>
            <div className="admin-card-body" style={{ padding: '0 30px' }}>
              <div className="admin-table-container" style={{ border: 'none' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Module Name</th>
                      <th>Total Items</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => navigate('/tbp-admin/protocol-section')} style={{ cursor: 'pointer' }}>
                      <td><i className="fa-solid fa-list-check" style={{ marginRight: '10px', color: '#6366f1' }}></i> Protocol Steps</td>
                      <td><strong>{counts.protocols}</strong> Steps</td>
                      <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--admin-success)', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE</span></td>
                    </tr>
                    <tr onClick={() => navigate('/tbp-admin/packages-section')} style={{ cursor: 'pointer' }}>
                      <td><i className="fa-solid fa-box-archive" style={{ marginRight: '10px', color: '#10b981' }}></i> Pricing Tiers</td>
                      <td><strong>{counts.packages}</strong> Packages</td>
                      <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--admin-success)', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE</span></td>
                    </tr>
                    <tr onClick={() => navigate('/tbp-admin/contact-section')} style={{ cursor: 'pointer' }}>
                      <td><i className="fa-solid fa-envelope" style={{ marginRight: '10px', color: '#f59e0b' }}></i> Contact Details</td>
                      <td>{counts.contactStatus}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ 
                          color: counts.contactStatus === 'Configured' ? 'var(--admin-success)' : 'var(--admin-error)', 
                          fontSize: '0.8rem', 
                          fontWeight: '700' 
                        }}>
                          {counts.contactStatus === 'Configured' ? 'ACTIVE' : 'INCOMPLETE'}
                        </span>
                      </td>
                    </tr>
                    {lastUpdate && (
                      <tr 
                        onClick={() => {
                          const routeMap = {
                            'Hero': 'hero-section',
                            'FAQs': 'faqs-section',
                            'Portfolio': 'result-section',
                            'Protocol': 'protocol-section',
                            'Pricing': 'packages-section',
                            'Video Leads': 'clients-section',
                            'Contact': 'contact-section'
                          };
                          navigate(`/tbp-admin/${routeMap[lastSection] || ''}`);
                        }} 
                        style={{ cursor: 'pointer' }}
                      >
                        <td><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '10px', color: '#818cf8' }}></i> Last Update</td>
                        <td>{lastSection} Section</td>
                        <td style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--admin-text-sub)' }}>{lastUpdate}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Sidebar */}
        <div>
          <div className="admin-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', border: 'none' }}>
            <div className="admin-card-body" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-microchip" style={{ color: '#6366f1' }}></i>
                System Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Environment</div>
                  <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Production <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.7rem' }}>Vercel</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Database</div>
                  <div style={{ fontWeight: '600' }}>MongoDB Atlas Cloud</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Media Storage</div>
                  <div style={{ fontWeight: '600' }}>Cloudinary Digital Asset</div>
                </div>
                <div style={{ marginTop: '10px', padding: '15px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}>API Latency</div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', position: 'relative' }}>
                    <div style={{ 
                      width: `${Math.min((latency / 500) * 100, 100)}%`, 
                      height: '100%', 
                      backgroundColor: latency < 300 ? '#10b981' : latency < 600 ? '#f59e0b' : '#ef4444', 
                      borderRadius: '3px',
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span>{latency < 300 ? 'Optimal' : latency < 600 ? 'Moderate' : 'High Latency'}</span>
                    <span>{latency}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-card">
            <div className="admin-card-body" style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 15px' }}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h4 style={{ marginBottom: '8px' }}>Admin Security</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', lineHeight: '1.5' }}>
                Your session is protected with JWT encryption and secure HTTP-only configurations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
