import React from 'react';

function HardwareIntegration() {
  const hardwareFeatures = [
    { icon: '🔒', title: 'Secure MAC Address Pairing', description: 'Every bracelet has a unique hardware ID. Only the registered parent and the event organizer can view the child\'s location.' },
    { icon: '🔋', title: 'Smart Battery Monitoring', description: 'The app actively tracks the exact battery percentage of every device, sending alerts well before a tracker goes offline.' },
    { icon: '📍', title: 'Precision Location Engine', description: 'Calculates pinpoint accuracy within the event geofence, instantly detecting if a tracker crosses the boundary line.' },
    { icon: '🛡️', title: 'Kid-Tough & Tamper-Proof', description: 'Designed to stay securely on the wrist throughout the entire event, resisting water, dirt, and accidental removal.' }
  ];

  return (
    <>
      <style>{`
        .hardware-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .bracelet-graphic-container { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 24px; padding: 80px 20px; display: flex; justify-content: center; align-items: center; position: relative; box-shadow: inset 0 2px 10px rgba(255,255,255,0.5); border: 1px solid #cbd5e1; min-height: 350px; }
        .smart-bracelet { width: 140px; height: 200px; border: 24px solid #1e293b; border-radius: 60px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.15), inset 0 10px 20px rgba(0,0,0,0.5); background: #0f172a; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .bracelet-screen { width: 80px; height: 100px; background: #000; border-radius: 12px; border: 2px solid #334155; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: inset 0 0 15px rgba(22, 163, 74, 0.2); }
        .pulsing-dot { width: 12px; height: 12px; background-color: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: hardwarePulse 2s infinite; margin-bottom: 10px; }
        
        .floating-tag-1 { position: absolute; top: 30px; left: 20px; background: #fff; padding: 8px 12px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); font-size: 0.75rem; font-weight: bold; color: '#0f172a'; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 5px; z-index: 2; }
        .floating-tag-2 { position: absolute; bottom: 30px; right: 20px; background: #fff; padding: 8px 12px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); font-size: 0.75rem; font-weight: bold; color: '#0f172a'; border: 1px solid #e2e8f0; z-index: 2; }

        @keyframes hardwarePulse { 0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0); } }

        /* PREVENT OVERLAPPING ON MOBILE */
        @media (max-width: 950px) {
          .hardware-grid { grid-template-columns: 1fr; gap: 40px; }
          .bracelet-graphic-container { padding: 50px 20px; min-height: 280px; }
          .smart-bracelet { transform: scale(0.85); }
          .floating-tag-1 { top: 10px; left: 10px; font-size: 0.65rem; padding: 6px 10px; }
          .floating-tag-2 { bottom: 10px; right: 10px; font-size: 0.65rem; padding: 6px 10px; }
        }
      `}</style>

      <section style={{ padding: '80px 20px', backgroundColor: '#fafcfd' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="hardware-grid">
            <div className="bracelet-graphic-container">
              <div className="floating-tag-1"><span style={{ color: '#16a34a' }}>●</span> Active Sync</div>
              <div className="floating-tag-2">MAC: A1:B2:C3:D4</div>
              <div className="smart-bracelet">
                <div className="bracelet-screen">
                  <div className="pulsing-dot"></div>
                  <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 'bold' }}>85%</div>
                  <div style={{ color: '#10b981', fontSize: '0.6rem', marginTop: '2px' }}>SAFE</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#0f172a', textAlign: 'left' }}>
                Industrial-Grade Tracking, <br/><span style={{ color: '#2563eb' }}>Parent-Approved Simplicity.</span>
              </h2>
              <p className="page-subtitle" style={{ color: '#64748b', marginBottom: '30px', textAlign: 'left', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Our software is powered by specialized, high-fidelity hardware. When you pair a bracelet at the event gate, you are activating a secure, closed-loop safety network.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {hardwareFeatures.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '45px', height: '45px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{feature.icon}</div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{feature.title}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HardwareIntegration;