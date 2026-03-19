import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <div className="footer-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff" opacity="0.9"/>
                <circle cx="12" cy="9" r="2.5" fill="#0ea5e9"/>
              </svg>
            </div>
            <span className="footer-logo-text">SafeTrack <span>Kids</span></span>
          </a>
          <p className="footer-tagline">Real-Time Child Safety for Crowded Events</p>
        </div>

        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>

        <p className="footer-copy">© 2026 SafeTrack Kids. All rights reserved.</p>
      </div>
    </footer>
  );
}