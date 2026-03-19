import React, { useEffect, useRef } from 'react';

const FEATURES = [
  { color: 'blue', title: 'Live Location Tracking', desc: "See your child's real-time location with sub-2-second updates using BLE and GPS technology.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
  { color: 'green', title: 'Safe Zones', desc: 'Define boundaries within the event. Get alerted instantly if your child leaves the designated area.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { color: 'orange', title: 'Instant Alerts', desc: 'Receive immediate notifications for out-of-zone movements, low battery, or connection issues.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { color: 'purple', title: 'Auto Data Deletion', desc: 'All tracking data is automatically deleted after the event ends. Zero data retention.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> },
  { color: 'teal', title: 'Saudi PDPL Compliant', desc: "Fully compliant with Saudi Arabia's Personal Data Protection Law and international standards.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  { color: 'red', title: 'Enterprise Security', desc: "Bank-grade encryption for all data transmission. Your family's privacy is our priority.", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="12" x2="15" y2="12"/></svg> },
];

export default function Features() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
      }
    }), { threshold: 0.1 });
    cardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .features-grid { display: flex; flex-direction: column; gap: 20px; }
          .features-card { width: 100%; box-sizing: border-box; }
        }
        @media (min-width: 901px) {
          .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        }
      `}</style>
      <section className="features" id="features" style={{ backgroundColor: '#fafcfd', padding: '80px 20px' }}>
        <div className="container">
          <div className="features-section-label" style={{ textAlign: 'center' }}>Capabilities</div>
          <h2 className="features-section-title" style={{ textAlign: 'center' }}>Everything You Need for Peace of Mind</h2>
          <p className="features-section-subtitle" style={{ textAlign: 'center', marginBottom: '40px' }}>Designed with parents in mind. Trusted by event organizers worldwide.</p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} ref={el => (cardRefs.current[i] = el)} className="features-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease', background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className={`features-icon features-icon--${f.color}`} style={{ marginBottom: '15px', color: '#2563eb' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#64748b' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}