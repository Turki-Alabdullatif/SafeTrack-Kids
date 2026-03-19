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

export default function CTA() {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .cta-actions { display: flex; flex-direction: column; width: 100%; gap: 15px; }
          .cta-actions a { width: 100%; justify-content: center; text-align: center; display: flex; align-items: center; gap: 8px; padding: 15px; border-radius: 8px; box-sizing: border-box; }
          .cta-box { padding: 40px 20px; }
        }
        @media (min-width: 769px) {
          .cta-actions { display: flex; justify-content: center; gap: 20px; }
          .cta-actions a { display: flex; align-items: center; gap: 8px; padding: 15px 30px; border-radius: 8px; }
        }
      `}</style>
      <section className="cta" style={{ backgroundColor: '#fafcfd', padding: '80px 20px' }}>
        <div className="container">
          <div className="cta-box" style={{ background: '#0f172a', borderRadius: '24px', padding: '60px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div className="cta-glow" />
            <div className="cta-label" style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '10px' }}>Get Started Today</div>
            <h2 className="cta-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Experience SafeTrack Today</h2>
            <p className="cta-subtitle" style={{ color: '#94a3b8', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Join thousands of parents who trust SafeTrack Kids to keep their children safe at events.
            </p>
            <div className="cta-actions">
              <a href="/demo-parent" className="cta-btn cta-btn-primary" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                <EyeIcon /> View Parent Demo
              </a>
              <a href="/demo-organizer" className="cta-btn cta-btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                Organizer Demo <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}