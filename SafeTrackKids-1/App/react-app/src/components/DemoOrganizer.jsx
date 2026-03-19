import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from './Header';
import Footer from './Footer';

const getCustomDotIcon = (batteryLevel, isOutOfZone) => {
  let color = '#10b981'; let animation = 'none';
  if (batteryLevel <= 20 && batteryLevel > 0) color = '#f97316'; 
  if (batteryLevel === 0) color = '#6b7280'; 
  if (isOutOfZone) { color = '#ef4444'; animation = 'pulse 1.5s infinite'; } 
  return L.divIcon({ className: 'custom-dot-marker', html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); animation: ${animation};"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
};

export default function DemoOrganizer() {
  const demoKids = [
    { id: 1, name: 'Ahmad', bat: 85, isOut: false, pos: [25.3819, 49.5828], mac: 'A1:B2' },
    { id: 2, name: 'Sarah',  bat: 15, isOut: false, pos: [25.3822, 49.5833], mac: 'C3:D4' }, 
    { id: 3, name: 'Khalid', bat: 70, isOut: true,  pos: [25.3840, 49.5860], mac: 'E5:F6' }, 
    { id: 4, name: 'Laila',  bat: 0,  isOut: false, pos: [25.3813, 49.5821], mac: 'G7:H8' }, 
  ];
  
  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
      <Header />
      <main style={{ flex: 1, padding: '30px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold' }}>
          👀 You are viewing the Interactive Demo (Read-Only)
        </div>

        {/* Fake Alert Banner */}
        <div style={{ backgroundColor: '#fee2e2', border: '2px solid #ef4444', color: '#991b1b', padding: '16px 20px', borderRadius: '12px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🚨</span><strong style={{ fontSize: '1.2rem', color: '#7f1d1d' }}>GEOFENCE BREACH DETECTED</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Khalid</span> <span style={{ cursor: 'not-allowed', color: '#ef4444', fontWeight: 'bold' }}>📍 Locate Child</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>Demo Event Console</h2>
            <p className="page-subtitle" style={{ margin: '0', color: '#64748b' }}>Manage your events and track active bracelets.</p>
          </div>
          <Link to="/register" style={{ padding: '12px 20px', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', textDecoration: 'none' }}>
            Create Organizer Account
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '50px', height: '50px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>👥</div><div><h4 style={{ fontSize: '1.5rem', margin: 0 }}>4</h4><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Active Bracelets</p></div></div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '50px', height: '50px', backgroundColor: '#fff7ed', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🔋</div><div><h4 style={{ fontSize: '1.5rem', margin: 0 }}>1</h4><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Low Battery</p></div></div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ width: '50px', height: '50px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>⚠️</div><div><h4 style={{ fontSize: '1.5rem', margin: 0, color: '#ef4444' }}>1</h4><p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Alerts</p></div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }} className="demo-grid">
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', minHeight: '500px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a' }}>Event Overview Map</h3>
            <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '3px solid #10b981' }}>
              <MapContainer center={[25.3815, 49.5830]} zoom={17} zoomControl={false} style={{ height: '100%', width: '100%' }}>
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
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#0f172a' }}>Bracelet Status</h3>
            {demoKids.map(kid => {
               let batColor = '#10b981'; 
               if (kid.bat <= 20) batColor = '#f97316'; 
               if (kid.bat === 0) batColor = '#6b7280'; 
               return (
                <div key={kid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{kid.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{kid.mac}</span>
                  </div>
                  <div style={{ backgroundColor: batColor, color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>{kid.bat}%</div>
                </div>
               )
            })}
          </div>
        </div>

      </main>
      <Footer />
      <style>{`@media (max-width: 950px) { .demo-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}