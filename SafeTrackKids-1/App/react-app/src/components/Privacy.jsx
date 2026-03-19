import React from 'react';

const POINTS = [
  { title: 'Automatic Data Deletion', desc: 'All location and personal data is automatically deleted within 24 hours after the event ends. No exceptions.' },
  { title: 'End-to-End Encryption', desc: 'Every piece of data is encrypted during transmission and at rest using industry-standard protocols.' },
  { title: 'You Control the Data', desc: "Only you can access your child's location. Event organizers see anonymized data for crowd management only." },
  { title: 'Regulatory Compliance', desc: 'Fully compliant with Saudi PDPL, GDPR, and other international data protection regulations.' },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function Privacy() {
  return (
    <>
      <style>{`
        .privacy-inner { display: flex; align-items: center; justify-content: space-between; gap: 50px; }
        .privacy-content { flex: 1; }
        .privacy-visual { flex: 1; display: flex; flex-direction: column; align-items: center; }
        
        @media (max-width: 900px) {
          .privacy-inner { flex-direction: column; text-align: left; gap: 40px; }
          .privacy-visual { width: 100%; order: -1; } /* Puts the shield on top for mobile */
        }
      `}</style>
      <section className="privacy" id="privacy" style={{ backgroundColor: '#fafcfd', padding: '80px 20px' }}>
        <div className="container">
          <div className="privacy-inner">
            <div className="privacy-content">
              <div className="privacy-section-label">Trust &amp; Transparency</div>
              <h2 className="privacy-section-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Your Privacy is<br />Non-Negotiable</h2>
              <p className="privacy-section-subtitle" style={{ color: '#64748b', marginBottom: '30px' }}>We understand the sensitivity of tracking children. That's why we've built the most privacy-focused tracking system in the industry.</p>
              <div className="privacy-points" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {POINTS.map(p => (
                  <div key={p.title} className="privacy-point" style={{ display: 'flex', gap: '15px' }}>
                    <div className="privacy-check" style={{ color: '#16a34a', marginTop: '3px' }}><CheckIcon /></div>
                    <div>
                      <strong style={{ display: 'block', marginBottom: '5px' }}>{p.title}</strong>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="privacy-visual">
              <div className="privacy-shield" style={{ width: '150px', height: '150px', backgroundColor: '#e0f2fe', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#2563eb' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}