import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getCustomDotIcon = (batteryLevel, isOutOfZone) => {
  let color = '#10b981'; 
  let animation = 'none';

  if (batteryLevel <= 20 && batteryLevel > 0) color = '#f97316'; 
  if (batteryLevel === 0) color = '#6b7280'; 
  
  if (isOutOfZone) { 
    color = '#ef4444'; 
    animation = 'pulse 1.5s infinite'; 
  } 

  return L.divIcon({
    className: 'custom-dot-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); animation: ${animation};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const demoKids = [
  { id: 1, name: 'Ahmad', bat: 85, isOut: false, pos: [25.3819, 49.5828] },
  { id: 2, name: 'Sarah',  bat: 15, isOut: false, pos: [25.3822, 49.5833] }, 
  { id: 3, name: 'Khalid', bat: 70, isOut: true,  pos: [25.3840, 49.5860] }, // Khalid is out of zone
  { id: 4, name: 'Laila',  bat: 0,  isOut: false, pos: [25.3813, 49.5821] }, 
];

const geofenceCenter = [25.3815, 49.5830];
const geofenceRadius = 150;

export default function DashboardPreview() {
  return (
    <>
      <style>{`
        .preview-map-box { height: 500px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; position: relative; }
        
        /* Default Desktop Legend */
        .demo-map-legend { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.95); padding: 15px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; font-size: 0.8rem; color: #475569; text-align: left; }
        .demo-legend-title { display: block; margin-bottom: 10px; color: #0f172a; font-weight: bold; }
        .demo-legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .demo-legend-dot { width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .preview-map-box { height: 350px; } 
          
          /* Shrink legend and move to bottom-left so it doesn't block the circle */
          .demo-map-legend { 
            top: auto; 
            bottom: 15px; 
            left: 10px; 
            right: auto;
            padding: 8px 12px; 
            font-size: 0.7rem; 
          }
          .demo-legend-title { margin-bottom: 6px; font-size: 0.75rem; }
          .demo-legend-item { margin-bottom: 4px; gap: 6px; }
          .demo-legend-dot { width: 8px; height: 8px; }
        }
      `}</style>
      <section style={{ padding: '80px 20px', backgroundColor: '#fafcfd' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <h2 className="page-title" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', marginBottom: '10px', color: '#0f172a' }}>
            Instantly Visualize Your Geofence
          </h2>
          <p className="page-subtitle" style={{ maxWidth: '700px', margin: '0 auto 50px auto', color: '#64748b' }}>
            This is exactly what you see. Every active tracker is perfectly mapped, letting you monitor crowds or keep your family safe in seconds.
          </p>
          
          <div className="preview-map-box">
            <MapContainer center={geofenceCenter} zoom={17} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{ height: '100%', width: '100%', cursor: 'default' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
              <Circle center={geofenceCenter} radius={geofenceRadius} pathOptions={{ color: '#10b981', fillColor: '#d1fae5', fillOpacity: 0.1, weight: 2 }} />
              {demoKids.map(kid => (
                <Marker key={kid.id} position={kid.pos} icon={getCustomDotIcon(kid.bat, kid.isOut)}>
                  <Popup><strong>{kid.name}</strong><br/><b>Batt: {kid.bat}%</b></Popup>
                </Marker>
              ))}
            </MapContainer>

            <div className="demo-map-legend">
              <span className="demo-legend-title">Live Demo Key</span>
              <div className="demo-legend-item"><div className="demo-legend-dot" style={{ background: '#10b981' }}></div> Safe & Active</div>
              <div className="demo-legend-item"><div className="demo-legend-dot" style={{ background: '#f97316' }}></div> Low Battery</div>
              <div className="demo-legend-item"><div className="demo-legend-dot" style={{ background: '#6b7280' }}></div> Offline (0%)</div>
              <div className="demo-legend-item"><div className="demo-legend-dot" style={{ background: '#ef4444', animation: 'pulse 1.5s infinite' }}></div> Out of Zone</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}