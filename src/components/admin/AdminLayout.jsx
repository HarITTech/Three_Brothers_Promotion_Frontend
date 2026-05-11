import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import '../../admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/tbp-admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/tbp-admin/login');
  };

  const navLinks = [
    { path: '/tbp-admin', label: 'Dashboard', icon: 'fa-gauge' },
    { path: '/tbp-admin/hero-section', label: 'Hero Section', icon: 'fa-desktop' },
    { path: '/tbp-admin/stat-section', label: 'Stat Section', icon: 'fa-chart-simple' },
    { path: '/tbp-admin/result-section', label: 'Result Section', icon: 'fa-square-poll-vertical' },
    { path: '/tbp-admin/protocol-section', label: 'Protocol Section', icon: 'fa-list-check' },
    { path: '/tbp-admin/packages-section', label: 'Packages Section', icon: 'fa-box-archive' },
    { path: '/tbp-admin/faqs-section', label: 'FAQs Section', icon: 'fa-circle-question' },
    { path: '/tbp-admin/clients-section', label: 'Clients Section', icon: 'fa-users' },
    { path: '/tbp-admin/contact-section', label: 'Contact Section', icon: 'fa-envelope' },
    { path: '/tbp-admin/team-section', label: 'Team Section', icon: 'fa-user-tie' },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span>TBP</span> Admin
        </div>
        <nav className="admin-sidebar-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`admin-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <i className={`fa-solid ${link.icon}`} style={{ width: '20px', marginRight: '12px' }}></i>
              <span>{link.label}</span>
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button className="admin-nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <i className="fa-solid fa-right-from-bracket" style={{ width: '20px', marginRight: '12px' }}></i>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
