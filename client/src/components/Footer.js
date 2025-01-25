import React from 'react';
import '../assets/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 Tech Event Networking</p>
        <p>Connect. Learn. Grow.</p>
      </div>
      <div className="footer-social">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
          <i className="fab fa-facebook"></i>
        </a>
        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon">
          <i className="fab fa-linkedin"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
