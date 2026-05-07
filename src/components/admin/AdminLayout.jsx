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
    { path: '/tbp-admin', label: 'Dashboard' },
    { path: '/tbp-admin/hero-section', label: 'Hero Section' },
    { path: '/tbp-admin/stat-section', label: 'Stat Section' },
    { path: '/tbp-admin/result-section', label: 'Result Section' },
    { path: '/tbp-admin/protocol-section', label: 'Protocol Section' },
    { path: '/tbp-admin/packages-section', label: 'Packages Section' },
    { path: '/tbp-admin/faqs-section', label: 'FAQs Section' },
    { path: '/tbp-admin/clients-section', label: 'Clients Section' },
    { path: '/tbp-admin/contact-section', label: 'Contact Section' },
  ];

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">TBP Admin</div>
        <nav className="admin-sidebar-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`admin-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <button className="admin-nav-link" onClick={handleLogout} style={{ textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
