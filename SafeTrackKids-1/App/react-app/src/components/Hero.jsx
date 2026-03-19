import React from 'react';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function Hero() {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .hero-actions { display: flex; flex-direction: column; width: 100%; gap: 15px; }
          .hero-actions a { width: 100%; justify-content: center; text-align: center; }
          .hero-stats { display: flex; flex-direction: column; gap: 15px; }
          .hero-stat-card { width: 100%; }
        }
      `}</style>
      <section className="hero" id="hero" style={{ backgroundColor: '#fafcfd' }}>
        <div className="container hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Live at 100+ Events Worldwide
          </div>

          <h1 className="hero-title">
            Real-Time Child Safety<br />
            <span className="hero-title-accent">for Crowded Events</span>
          </h1>

          <p className="hero-subtitle">
            No app downloads. Just scan a QR code and instantly track your child's
            location at festivals, exhibitions, and theme parks.
          </p>

          <div className="hero-actions">
            <a href="/demo-parent" className="hero-btn hero-btn-primary">
              <EyeIcon /> View Demo Dashboard
            </a>
            <a href="#how-it-works" className="hero-btn hero-btn-secondary">
              How It Works <ArrowIcon />
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <div className="hero-stat-label hero-stat-label--green">
                <span className="hero-pulse-dot" /> Always Connected
              </div>
              <p>System stays online throughout the event</p>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-label hero-stat-label--blue">
                <ClockIcon /> Near-Instant Tracking
              </div>
              <p>Location updates refresh in under 2 seconds</p>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-label hero-stat-label--purple">
                <LockIcon /> Privacy Protected
              </div>
              <p>PDPL compliant</p>
            </div>
          </div>

          {/* Floating device card */}
          <div className="hero-device">
            <div className="hero-device-header">
              <div className="hero-device-logo">ST</div>
              <div>
                <div className="hero-device-title">SafeTrack</div>
                <div className="hero-device-sub">
                  Connection <span className="hero-active-tag">Active</span>
                </div>
              </div>
              <div className="hero-battery">Battery <strong>95%</strong></div>
            </div>
            <div className="hero-map">
              <div className="hero-map-grid" />
              <div className="hero-map-zone" />
              <div className="hero-map-pin">
                <div className="hero-pin-pulse" />
                <div className="hero-pin-dot" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}