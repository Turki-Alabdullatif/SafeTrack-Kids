import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from './Header';
import Footer from './Footer';

const getCustomDotIcon = (batteryLevel, isOutOfZone) => {
  let color = '#10b981'; let animation = 'none';
  if (batteryLevel <= 20) color = '#f97316'; 
  if (batteryLevel === 0) color = '#6b7280'; 
  if (isOutOfZone) { color = '#ef4444'; animation = 'pulse 1.5s infinite'; } 
  return L.divIcon({ className: 'custom-dot-marker', html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); animation: ${animation};"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
};

export default function DemoParent() {
  const demoKids = [
    { id: 1, name: 'Ahmad (Yours)', bat: 85, isOut: false, pos: [25.3819, 49.5828], mac: 'A1:B2:C3:D4' }
  ];
  
  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
      <Header />
      <main style={{ flex: 1, padding: '30px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold' }}>
          👀 You are viewing the Interactive Demo (Read-Only)
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>Welcome, Demo Parent</h2>
            <p className="page-subtitle" style={{ margin: '0', color: '#64748b' }}>Monitor your children's real-time safety status.</p>
          </div>
          <Link to="/register" style={{ padding: '12px 20px', backgroundColor: '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', textDecoration: 'none' }}>
            Create Real Account
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🛡️</div>
            <div><h4 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>1</h4><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Kids Protected</p></div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🔋</div>
            <div><h4 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>0</h4><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Need Charging</p></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }} className="demo-grid">
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', minHeight: '500px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a' }}>Live Family Map</h3>
            <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '3px solid #10b981' }}>
              <MapContainer center={[25.3815, 49.5830]} zoom={18} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                <Circle center={[25.3815, 49.5830]} radius={150} pathOptions={{ color: '#10b981', fillColor: '#d1fae5', fillOpacity: 0.2 }} />
                {demoKids.map(kid => (
                  <Marker key={kid.id} position={kid.pos} icon={getCustomDotIcon(kid.bat, kid.isOut)}>
                    <Popup><strong>{kid.name}</strong><br/><b>Batt: {kid.bat}%</b></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a' }}>Active Sessions</h3>
            {demoKids.map(kid => (
              <div key={kid.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{kid.name}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⌚ {kid.mac}</span>
                <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', alignSelf: 'flex-start' }}>{kid.bat}%</div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
      <style>{`@media (max-width: 950px) { .demo-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}