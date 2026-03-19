import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- 🗺️ SMART MAP CONTROLLER 🗺️ ---
function MapController({ center, radius, isLocked, focusedLoc }) {
  const map = useMap();
  const prevFocused = useRef(focusedLoc);

  useEffect(() => {
    if (!map) return;

    if (isLocked) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
    }

    const timeoutId = setTimeout(() => {
      try {
        map.invalidateSize();

        if (focusedLoc && !isNaN(focusedLoc[0])) {
          map.panTo(focusedLoc, { animate: true, duration: 1.0 });
        } else if (center && !isNaN(center[0])) {
          // If map is locked, OR if we just clicked "Cancel Focus", frame the circle!
          if (isLocked || (prevFocused.current !== null && focusedLoc === null)) {
            const circleBounds = L.circle(center, { radius: radius + 50 }).getBounds();
            map.fitBounds(circleBounds, { animate: true, padding: [0, 0] });
          }
        }
        prevFocused.current = focusedLoc; // Remember state for next render
      } catch (err) {
        console.warn("Map resizing safely caught:", err);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [center, radius, isLocked, focusedLoc, map]);
  return null;
}

function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loadingData, setLoadingData] = useState(true);
  const [parentName, setParentName] = useState('Parent');
  
  const [activeSessions, setActiveSessions] = useState([]);
  const [allMyChildren, setAllMyChildren] = useState([]); 
  
  const [zoneCenter, setZoneCenter] = useState([25.3815, 49.5830]); 
  const [zoneRadius, setZoneRadius] = useState(50);
  
  const [simulatedLocations, setSimulatedLocations] = useState({}); 
  const [wanderingAlerts, setWanderingAlerts] = useState([]); 
  
  const [isMapLocked, setIsMapLocked] = useState(true);
  const [focusedLoc, setFocusedLoc] = useState(null);

  const mapSectionRef = useRef(null);

  const [stats, setStats] = useState({ activeKids: 0, lowBattery: 0, alerts: 0 });

  const activeSessionsRef = useRef([]);
  useEffect(() => { activeSessionsRef.current = activeSessions; }, [activeSessions]);

  // --- 📡 THE TRUE RECEIVER: Polls DB every 3 seconds ---
  useEffect(() => {
    const syncTimer = setInterval(async () => {
      const currentSessions = activeSessionsRef.current;
      if (currentSessions.length === 0) {
        setSimulatedLocations({}); // Erase map pins if no active sessions
        return;
      }

      const kidIds = currentSessions.map(s => s.child_id);
      const sessionIds = currentSessions.map(s => s.session_id);

      const { data: sessionData } = await supabase
        .from('active_sessions')
        .select(`session_id, child_id, bracelet_id, event ( event_id, event_name, geofence_coordinates ), children ( name ), bracelet ( mac_address, battery_level )`)
        .in('child_id', kidIds).eq('is_active', true);

      if (sessionData && sessionData.length > 0) {
        setActiveSessions(sessionData);
        const lowBat = sessionData.filter(s => s.bracelet?.battery_level < 20).length;
        setStats(prev => ({ ...prev, activeKids: sessionData.length, lowBattery: lowBat }));

        const geo = sessionData[0].event?.geofence_coordinates;
        if (geo && typeof geo.lat === 'number') {
          setZoneCenter([geo.lat, geo.lng]);
          setZoneRadius(geo.radius || 50);
        }
      }

      const { data: locData } = await supabase
        .from('location_logs').select('*').in('session_id', sessionIds).order('timestamp', { ascending: false }).limit(50);

      if (locData && locData.length > 0) {
        const latestLocs = {};
        const newAlerts = [];

        locData.forEach(log => {
          if (!latestLocs[log.session_id]) {
            latestLocs[log.session_id] = [log.latitude, log.longitude];
            if (log.is_out_of_zone) {
              const cName = currentSessions.find(s => s.session_id === log.session_id)?.children?.name;
              if (cName) newAlerts.push({ name: cName, loc: [log.latitude, log.longitude] });
            }
          }
        });

        // FRESH OBJECT: Replaces old locations so deleted sessions disappear!
        setSimulatedLocations(latestLocs);
        setWanderingAlerts(newAlerts);
        setStats(prev => ({ ...prev, alerts: newAlerts.length }));
      }
    }, 3000); 
    return () => clearInterval(syncTimer);
  }, []);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (!user) { navigate('/loginCard'); return; }
    const fetchParentData = async () => {
      try {
        setLoadingData(true);
        const { data: parentData } = await supabase.from('parent').select('*').eq('user_id', user.id).single();
        
        if (parentData) {
          setParentName(parentData.first_name || parentData.name || 'Parent');
          const parentId = parentData.parent_id || parentData.Parent_ID || parentData.id;

          const { data: kidsData } = await supabase.from('children').select('*').eq('parent_id', parentId);
          if (kidsData && kidsData.length > 0) {
            setAllMyChildren(kidsData); 
            const kidIds = kidsData.map(k => k.child_id || k.id);
            const { data: sessionData } = await supabase.from('active_sessions').select(`session_id, bracelet_id, child_id, event ( event_name, geofence_coordinates ), children ( name ), bracelet ( mac_address, battery_level )`).in('child_id', kidIds).eq('is_active', true);
            
            setActiveSessions(sessionData || []);
            if (sessionData && sessionData.length > 0) {
              const lowBat = sessionData.filter(s => s.bracelet?.battery_level < 20).length;
              setStats({ activeKids: sessionData.length, lowBattery: lowBat, alerts: 0 });

              const firstEvent = sessionData[0].event;
              if (firstEvent && firstEvent.geofence_coordinates && typeof firstEvent.geofence_coordinates.lat === 'number') {
                setZoneCenter([firstEvent.geofence_coordinates.lat, firstEvent.geofence_coordinates.lng]);
                setZoneRadius(firstEvent.geofence_coordinates.radius || 50);
              }
            }
          }
        }
      } catch (error) { console.error("Error:", error.message); } 
      finally { setLoadingData(false); }
    };
    fetchParentData();
  }, [user, navigate]);

  const handleEndTracking = async (sessionId, childName, braceletId) => {
    const confirmEnd = window.confirm(`Stop tracking ${childName} and release the hardware?`);
    if (!confirmEnd) return;
    try {
      const currentTime = new Date().toISOString(); 

      const { error: sessionError } = await supabase
        .from('active_sessions')
        .update({ is_active: false, check_out_time: currentTime })
        .eq('session_id', sessionId);

      if (sessionError) throw sessionError;

      if (braceletId) {
        const { error: bracError } = await supabase.from('bracelet').update({ status: 'Available' }).eq('Bracelet_id', braceletId);
        if (bracError) await supabase.from('bracelet').update({ status: 'Available' }).eq('bracelet_id', braceletId);
      }
      
      const remainingSessions = activeSessions.filter(s => s.session_id !== sessionId);
      setActiveSessions(remainingSessions);
      setStats(prev => ({ ...prev, activeKids: prev.activeKids - 1 }));
      
      alert(`${childName}'s session closed and logged in history! Hardware is now Available for reuse.`);
    } catch (err) { alert("Error stopping session: " + err.message); }
  };

  // --- CLEAN DOT ICON GENERATOR ---
  const getCustomDotIcon = (batteryLevel, isOutOfZone) => {
    let color = '#10b981'; // Green (Safe)
    let animation = 'none';

    if (batteryLevel <= 20 && batteryLevel > 0) color = '#f97316'; // Orange (Low Battery)
    
    // Dead bracelets are Solid Grey and never flash!
    if (batteryLevel === 0) {
      color = '#6b7280';
    } else if (isOutOfZone) { 
      color = '#ef4444'; // Red for Alert
      animation = 'pulse 1.5s infinite'; 
    } 

    return L.divIcon({
      className: 'custom-dot-marker',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); animation: ${animation};"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  const handleLocateChild = (loc) => {
    setFocusedLoc(loc);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        /* RESPONSIVE CSS */
        .dashboard-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; gap: 15px; }
        .top-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .metric-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .metric-icon-bg { width: 48px; height: 48px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; flex-shrink: 0; }
        .metric-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 2px 0; }
        .metric-label { font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 500; }
        .dashboard-bottom-grid { display: grid; grid-template-columns: 2.5fr 1fr; gap: 20px; }
        .panel-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .panel-title { margin: 0 0 15px 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; }
        
        .map-legend { position: absolute; bottom: 20px; left: 20px; background: rgba(255,255,255,0.9); padding: 12px 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; font-size: 0.8rem; color: #475569; font-weight: 500; }
        .legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        
        .bracelet-list-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; }
        .battery-pill { padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: #fff; white-space: nowrap; }

        .alert-banner { background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; padding: 16px 20px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2); animation: pulseBorder 2s infinite; }
        .alert-kid-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.5); padding: 8px 12px; border-radius: 8px; margin-top: 8px; }
        
        .action-button-group { display: flex; alignItems: flex-end; gap: 15px; flex-wrap: wrap; }
        .map-wrapper { flex: 1; border-radius: 12px; overflow: hidden; z-index: 0; position: relative; min-height: 400px; height: 50vh; }

        @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0px rgba(239, 68, 68, 0); } }
        
        /* 📱 SMARTPHONE MEDIA QUERIES 📱 */
        @media (max-width: 950px) { 
          .dashboard-bottom-grid { grid-template-columns: 1fr; } 
          .dashboard-header-top { flex-direction: column; } 
          .action-button-group { width: 100%; flex-direction: column; align-items: stretch; }
          .action-button-group > button { width: 100%; justify-content: center; }
          .alert-kid-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .alert-kid-row button { width: 100%; }
          .panel-card { padding: 15px; }
          .map-wrapper { height: 400px; }
          
          .map-legend { padding: 8px 10px; font-size: 0.7rem; bottom: 10px; left: 10px; border-radius: 8px; }
          .legend-item { margin-bottom: 4px; gap: 6px; }
          .legend-dot { width: 8px; height: 8px; }
        }
      `}</style>

      <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
        <Header />
        <main style={{ flex: 1, padding: '30px 20px', display: 'flex', flexDirection: 'column', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {wanderingAlerts.length > 0 && (
            <div className="alert-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>🚨</span>
                <strong style={{ fontSize: '1.2rem', color: '#7f1d1d' }}>GEOFENCE BREACH DETECTED</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>The following children have left the safe zone. Please locate them immediately.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {wanderingAlerts.map((kid, idx) => (
                  <div key={idx} className="alert-kid-row">
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{kid.name}</span>
                    <button onClick={() => handleLocateChild(kid.loc)} style={{ padding: '10px 15px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      📍 Locate Child
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dashboard-header-top">
            <div>
              <h2 className="page-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>Welcome, {parentName}</h2>
              <p className="page-subtitle" style={{ margin: '0', color: '#64748b' }}>Monitor your children's real-time safety status.</p>
            </div>
            
            <div className="action-button-group">
              <button onClick={() => alert("Connecting to Event Security/Organizer...")} style={{ padding: '12px 20px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📞 Contact Organizer
              </button>
              
              <button onClick={() => navigate('/pairBracelet')} className="pair-btn" style={{ padding: '12px 20px', backgroundColor: '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }}>
                🔗 Pair New Bracelet
              </button>
            </div>
          </div>

          {loadingData ? <p style={{ color: '#64748b' }}>Loading family data...</p> : activeSessions.length === 0 ? (
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', minHeight: '400px', padding: '20px' }}>
              <span style={{ fontSize: '3rem', marginBottom: '15px' }}>🚸</span>
              <h3 style={{ color: '#0f172a', marginBottom: '10px', textAlign: 'center' }}>No Active Tracking Sessions</h3>
              <p style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center', maxWidth: '400px' }}>You aren't tracking any children right now. When you arrive at an event, pair a bracelet to see their live location.</p>
              <button onClick={() => navigate('/pairBracelet')} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Pair a Child's Bracelet</button>
            </div>
          ) : (
            <>
              <div className="top-metrics-row">
                <div className="metric-card"><div className="metric-icon-bg" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>🛡️</div><div><h4 className="metric-value">{stats.activeKids}</h4><p className="metric-label">Kids Protected</p></div></div>
                <div className="metric-card"><div className="metric-icon-bg" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>🔋</div><div><h4 className="metric-value">{stats.lowBattery}</h4><p className="metric-label">Devices Need Charging</p></div></div>
                <div className="metric-card" style={{ borderColor: wanderingAlerts.length > 0 ? '#ef4444' : '#e2e8f0', backgroundColor: wanderingAlerts.length > 0 ? '#fef2f2' : '#fff' }}><div className="metric-icon-bg" style={{ backgroundColor: '#f8fafc', color: wanderingAlerts.length > 0 ? '#ef4444' : '#64748b' }}>⚠️</div><div><h4 className="metric-value" style={{ color: wanderingAlerts.length > 0 ? '#ef4444' : '#0f172a' }}>{stats.alerts}</h4><p className="metric-label">Wandering Alerts</p></div></div>
              </div>

              <div className="dashboard-bottom-grid">
                
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="panel-title" style={{ margin: 0 }}>Live Family Map</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: isMapLocked ? '#16a34a' : '#64748b', cursor: 'pointer', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" checked={isMapLocked} onChange={(e) => { setIsMapLocked(e.target.checked); if(e.target.checked) setFocusedLoc(null); }} style={{ cursor: 'pointer' }} />
                        {isMapLocked ? '🔒 Map Locked' : '🔓 Map Unlocked'}
                      </label>
                      {focusedLoc && (
                        <button onClick={() => setFocusedLoc(null)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel Focus</button>
                      )}
                    </div>
                  </div>

                  <div ref={mapSectionRef} className="map-wrapper" style={{ border: isMapLocked ? '3px solid #10b981' : '1px solid #e2e8f0' }}>
                    <MapContainer center={zoneCenter} zoom={18} zoomControl={!isMapLocked} style={{ height: '100%', width: '100%', backgroundColor: '#f4f7f6', cursor: isMapLocked ? 'default' : 'grab' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                      
                      <MapController center={zoneCenter} radius={zoneRadius} isLocked={isMapLocked} focusedLoc={focusedLoc} />

                      <Circle center={zoneCenter} radius={zoneRadius} pathOptions={{ color: wanderingAlerts.length > 0 ? '#ef4444' : '#10b981', fillColor: wanderingAlerts.length > 0 ? '#fecaca' : '#d1fae5', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }} />
                      
                      {activeSessions.map(session => {
                        const loc = simulatedLocations[session.session_id];
                        if (!loc || isNaN(loc[0])) return null; 
                        
                        const childName = session.children?.name || 'Unknown';
                        const macAddress = session.bracelet?.mac_address || 'N/A';
                        const battery = session.bracelet?.battery_level || 0;
                        const isOutOfZone = wanderingAlerts.some(a => a.name === childName);
                        
                        return (
                          <Marker key={session.session_id} position={loc} icon={getCustomDotIcon(battery, isOutOfZone)}>
                            <Popup>
                              <strong>{childName}</strong><br/>
                              <span style={{color: '#64748b'}}>Mac: {macAddress}</span><br/>
                              <b style={{color: isOutOfZone ? '#ef4444' : 'black'}}>{isOutOfZone ? "⚠️ OUT OF ZONE" : "Safe inside zone"}</b><br/>
                              <b>Batt: {battery}%</b>
                            </Popup>
                          </Marker>
                        )
                      })}
                    </MapContainer>

                    <div className="map-legend">
                      <strong style={{ display: 'block', marginBottom: '8px', color: '#0f172a' }}>Status</strong>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div> Safe & Active</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> Out of Zone (Alert)</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#f97316' }}></div> Low Battery</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#6b7280' }}></div> Offline (0%)</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                    <h3 className="panel-title">Active Sessions</h3>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                      {activeSessions.map((session) => {
                        const batLevel = session.bracelet?.battery_level || 0;
                        let batColor = '#10b981'; 
                        if (batLevel <= 20) batColor = '#f97316'; 
                        if (batLevel === 0) batColor = '#6b7280'; 

                        const childName = session.children?.name || 'Unknown Child';
                        
                        return (
                          <div key={session.session_id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block', fontSize: '1rem' }}>{childName}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>📍 Event: {session.event?.event_name || 'N/A'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⌚ {session.bracelet?.mac_address}</span>
                              </div>
                              <div style={{ backgroundColor: batColor, color: '#fff', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>{batLevel}%</div>
                            </div>
                            <button onClick={() => handleEndTracking(session.session_id, childName, session.bracelet_id)} style={{ width: '100%', marginTop: '5px', padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }}>Stop Tracking & Release</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 className="panel-title" style={{ margin: 0 }}>My Children</h3>
                      <button onClick={() => navigate('/registerChild')} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 12px', borderRadius: '6px', color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Add Child</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                      {allMyChildren.length > 0 ? allMyChildren.map((child) => (
                        <div key={child.child_id || child.id} className="bracelet-list-item">
                          <div><strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{child.name}</strong></div>
                          <div style={{ fontSize: '1.2rem' }}>👤</div>
                        </div>
                      )) : <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>No children registered.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

export default ParentDashboard;