import './Footer.css';
import logo from '../assets/images/logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a href="#home" className="footer-logo">
          <img src={logo} alt="Fobet Media" />
        </a>
        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#stats">Stats</a>
          <a href="#results">Results</a>
          <a href="#protocol">Protocol</a>
          <a href="#packages">Packages</a>
          <a href="#faq">FAQ</a>
          <a href="#team">Team</a>
        </div>
        <p className="footer-copy">
          &copy; {currentYear} Fobet Media. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
