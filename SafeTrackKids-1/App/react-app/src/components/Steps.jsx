import React, { useEffect, useRef } from 'react';

const STEPS = [
  { num: '01', title: 'Rent Bracelet', desc: 'Get a smart bracelet at event entrance. Lightweight, waterproof, and comfortable for kids.', icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>) },
  { num: '02', title: 'Scan QR Code', desc: 'Scan the QR code on the bracelet with your phone. No app installation required.', icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="4" height="4"/></svg>) },
  { num: '03', title: 'Track in Real-Time', desc: "View your child's location on an interactive map. Set safe zones and get instant alerts.", active: true, icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>) },
];

export default function Steps() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 120);
      }
    }), { threshold: 0.15 });
    cardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .steps-grid { display: flex; flex-direction: column; gap: 30px; align-items: center; }
          .steps-connector { display: none !important; }
          .steps-card { width: 100%; max-width: 400px; }
        }
      `}</style>
      <section className="steps" id="how-it-works" style={{ backgroundColor: '#fafcfd', padding: '80px 20px' }}>
        <div className="container">
          <div className="steps-section-label" style={{ textAlign: 'center' }}>Simple Setup</div>
          <h2 className="steps-section-title" style={{ textAlign: 'center' }}>Get Started in 3 Simple Steps</h2>
          <p className="steps-section-subtitle" style={{ textAlign: 'center', marginBottom: '40px' }}>Our system is designed for instant access. No complicated setup or app installations.</p>
          <div className="steps-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.num}>
                <div ref={el => (cardRefs.current[i] = el)} className={`steps-card ${step.active ? 'steps-card--active' : ''}`} style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease', flex: 1, textAlign: 'center', padding: '30px' }}>
                  <div className="steps-num" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '10px' }}>{step.num}</div>
                  <div className="steps-icon" style={{ color: '#2563eb', marginBottom: '15px' }}>{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p style={{ color: '#64748b' }}>{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div key={`connector-${i}`} className="steps-connector">
                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none"><path d="M0 8 H36 M32 4 L36 8 L32 12" stroke="rgba(14,165,233,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}