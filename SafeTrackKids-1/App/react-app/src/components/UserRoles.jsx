import React from 'react';

const parentFeatures = [
  '🛡️ View live, pulsing map updates',
  '🚨 Get instant breach/wandering alerts',
  '🔋 Monitor real-time bracelet battery',
  '📞 Quick-contact security or event staff',
  '👤 Track multiple children effortlessly',
];

const organizerFeatures = [
  '👥 Manage mass crowds & large groups',
  '📅 Central event creation and dashboard',
  '⚠️ Contact all parents instantly via Mass Notification',
  '🗺️ View real-time geofence statuses',
  '⚙️ Edit zone radius & center instantly',
];

function UserRoles() {
  return (
    <section style={{ padding: '80px 20px', backgroundColor: '#fafcfd' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#0f172a' }}>
          One Solution, Perfectly Tailored For Your Reality
        </h2>
        <p className="page-subtitle" style={{ maxWidth: '700px', margin: '0 auto 60px auto', color: '#64748b' }}>
          Our platform delivers exactly what you need, whether you are protecting your own family or managing a massive public event.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', justifyContent: 'center' }}>
          
          {/* FOR PARENTS CARD */}
          <div style={{ backgroundColor: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', color: '#16a34a' }}>🛡️</div>
            <h3 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>For Parents</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 30px 0', flex: 1 }}>
              Enjoy large events knowing your children are instantly locatable. This is peace of mind, automated.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              {parentFeatures.map((f, i) => (
                <li key={i} style={{ padding: '10px 0', fontSize: '0.9rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '12px' }}>{f}</li>
              ))}
            </ul>
          </div>

          {/* FOR ORGANIZERS CARD */}
          <div style={{ backgroundColor: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', color: '#16a34a' }}>👥</div>
            <h3 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>For Event Organizers</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 30px 0', flex: 1 }}>
              Take control of crowd safety. Set geofences, manage hardware, and mass-contact parents from a central hub.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              {organizerFeatures.map((f, i) => (
                <li key={i} style={{ padding: '10px 0', fontSize: '0.9rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '12px' }}>{f}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

export default UserRoles;