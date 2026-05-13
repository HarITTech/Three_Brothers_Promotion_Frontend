import { useState, useEffect } from 'react';
import './Header.css';
import logo from '../assets/images/logo.png';
import logo1 from '../assets/images/logo_text.png';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Stats', href: '#stats' },
  { label: 'Results', href: '#results' },
  { label: 'Protocol', href: '#protocol' },
  { label: 'Packages', href: '#packages' },
  { label: 'FAQ', href: '#faq' },
  { label: 'About Us', href: '#team' },
  // { label: 'Blog', href: '#' },
];

const SECTIONS = ['home', 'stats', 'results', 'protocol', 'packages', 'faq', 'team', 'contact'];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      let current = '';
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) current = id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const next = !isMenuOpen;
    setIsMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  return (
    <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
      <div className="header-container">
        <a href="#home" className="header-logo" onClick={closeMenu}>
          <div className='logo-div'>
            <img className="logo-img" src={logo} alt="TB" />
            <img className="logo-img1" src={logo1} alt="Three Brothers Promotions" />
          </div>
          
        </a>

        <nav className={`main-nav${isMenuOpen ? ' active' : ''}`} id="mainNav">
          <ul className="nav-menu">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className={activeSection && href === `#${activeSection}` ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {label}
                </a>
              </li>
            ))}
            {/* <li>
              <a
                href="https://fobetmedia.com/career/"
                className="careers-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                Careers&nbsp;<span className="hiring-badge">Hiring</span>
              </a>
            </li> */}
          </ul>
          <a href="#contact" className="header-cta" onClick={closeMenu}>
            Get Started <i className="fa-solid fa-arrow-right"></i>
          </a>
        </nav>

        <button
          className={`mobile-toggle${isMenuOpen ? ' active' : ''}`}
          id="mobileToggle"
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
