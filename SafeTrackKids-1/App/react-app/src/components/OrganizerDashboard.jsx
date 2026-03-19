import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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

function MapClickListener({ setZoneCenter, isLocked }) {
  useMapEvents({ click(e) { if (!isLocked) setZoneCenter([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loadingData, setLoadingData] = useState(true);
  const [orgName, setOrgName] = useState('Event Organizer');
  
  const [events, setEvents] = useState([]); 
  const [selectedEventId, setSelectedEventId] = useState('');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  
  const [activeBraceletsList, setActiveBraceletsList] = useState([]);
  const [simulatedLocations, setSimulatedLocations] = useState({}); 
  const [wanderingAlerts, setWanderingAlerts] = useState([]); 
  
  const [zoneCenter, setZoneCenter] = useState([25.3815, 49.5830]); 
  const [zoneRadius, setZoneRadius] = useState(50);
  const [isLocating, setIsLocating] = useState(false); 
  
  const [isMapLocked, setIsMapLocked] = useState(true);
  const [focusedLoc, setFocusedLoc] = useState(null);
  const mapSectionRef = useRef(null);
  
  const [stats, setStats] = useState({ activeBracelets: 0, outOfZoneAlerts: 0, lowBatteryWarnings: 0 });

  const activeBraceletsRef = useRef([]);
  useEffect(() => { activeBraceletsRef.current = activeBraceletsList; }, [activeBraceletsList]);

  // --- 🏃‍♂️ THE MASTER BROADCASTER ---
  useEffect(() => {
    const walkTimer = setInterval(() => {
      const currentList = activeBraceletsRef.current;
      if (currentList.length === 0 || !zoneCenter[0]) {
        setSimulatedLocations({}); // Clear map if no kids are active
        return;
      }

      setSimulatedLocations(prevLocs => {
        const newLocs = {}; // FRESH OBJECT: Automatically erases deleted/ended sessions!
        const newAlerts = [];
        const logsToProcess = [];

        currentList.forEach(session => {
          const sId = session.session_id;
          const childName = session.children?.name || 'Unknown Child';
          const batteryLevel = session.bracelet?.battery_level ?? 100;
          
          let currentPos = prevLocs[sId];

          if (!currentPos) currentPos = [zoneCenter[0] + (Math.random() - 0.5) * 0.0003, zoneCenter[1] + (Math.random() - 0.5) * 0.0003];

          let nextPos = currentPos;

          // Move ONLY if alive
          if (batteryLevel > 0) {
            const dLat = (Math.random() - 0.5) * 0.00008;
            const dLng = (Math.random() - 0.5) * 0.00008;
            nextPos = [currentPos[0] + dLat, currentPos[1] + dLng];
          }

          newLocs[sId] = nextPos;

          const distanceInMeters = L.latLng(zoneCenter[0], zoneCenter[1]).distanceTo(L.latLng(nextPos[0], nextPos[1]));
          const isOut = distanceInMeters > zoneRadius;

          if (isOut && batteryLevel > 0) newAlerts.push({ name: childName, loc: nextPos });

          logsToProcess.push({ 
            session_id: sId, 
            latitude: nextPos[0], 
            longitude: nextPos[1], 
            is_out_of_zone: isOut, 
            timestamp: new Date().toISOString() 
          });
        });

        // 💾 Upsert to Database
        if (logsToProcess.length > 0) {
          const updateDatabase = async () => {
            for (const log of logsToProcess) {
              const { data, error } = await supabase.from('location_logs').update({ latitude: log.latitude, longitude: log.longitude, is_out_of_zone: log.is_out_of_zone, timestamp: log.timestamp }).eq('session_id', log.session_id).select();
              if (!error && data && data.length === 0) await supabase.from('location_logs').insert([log]);
            }
          };
          updateDatabase();
        }

        setWanderingAlerts(newAlerts);
        setStats(prev => ({ ...prev, outOfZoneAlerts: newAlerts.length }));
        return newLocs;
      });
    }, 3000); 

    return () => clearInterval(walkTimer);
  }, [zoneCenter, zoneRadius]); 

  // --- 🔋 BATTERY DRAIN SIMULATOR ---
  useEffect(() => {
    const drainTimer = setInterval(async () => {
      const currentList = activeBraceletsRef.current;
      if (currentList.length === 0) return;

      setActiveBraceletsList(prevList => prevList.map(session => {
        if (session.bracelet && session.bracelet.battery_level > 0) {
          return { ...session, bracelet: { ...session.bracelet, battery_level: session.bracelet.battery_level - 1 } };
        }
        return session;
      }));

      for (const session of currentList) {
        if (session.bracelet && session.bracelet.battery_level > 0) {
          const newBattery = session.bracelet.battery_level - 1;
          const bId = session.bracelet_id;
          const { error } = await supabase.from('bracelet').update({ battery_level: newBattery }).eq('Bracelet_id', bId);
          if (error) await supabase.from('bracelet').update({ battery_level: newBattery }).eq('bracelet_id', bId);
        }
      }
    }, 60000); 
    return () => clearInterval(drainTimer);
  }, []);

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    if (!user) { navigate('/loginCard'); return; }
    const fetchInitialData = async () => {
      try {
        const { data: orgData } = await supabase.from('organizer').select('*').eq('user_id', user.id).single();
        if (orgData) {
          setOrgName(orgData.organization_name || 'Event Organizer');
          const foundOrgId = orgData.organizer_id || orgData.Organizer_ID || orgData.id;
          const { data: eventsData } = await supabase.from('event').select('*').eq('organizer_id', foundOrgId).neq('status', 'Closed').order('start_time', { ascending: false });
          if (eventsData && eventsData.length > 0) {
            setEvents(eventsData);
            setSelectedEventId(eventsData[0].event_id || eventsData[0].id); 
          }
        }
        setLoadingData(false);
      } catch (error) { setLoadingData(false); }
    };
    fetchInitialData();
  }, [user, navigate]);

  // --- 🔄 SYNC EVENT & SESSIONS (POLLING) ---
  useEffect(() => {
    if (!selectedEventId || events.length === 0) return;
    let pollTimer;

    const activeEvent = events.find(e => (e.event_id || e.id) == selectedEventId);
    setCurrentEvent(activeEvent);

    if (activeEvent) {
      if (activeEvent.geofence_coordinates && typeof activeEvent.geofence_coordinates.lat === 'number') {
        setZoneCenter([activeEvent.geofence_coordinates.lat, activeEvent.geofence_coordinates.lng]);
        setZoneRadius(activeEvent.geofence_coordinates.radius || 50);
      }
      
      const exactEventId = activeEvent.event_id || activeEvent.id;

      const fetchActiveSessions = async () => {
        const { data: braceletsData } = await supabase.from('active_sessions').select(`session_id, bracelet_id, children ( name ), bracelet ( mac_address, battery_level )`).eq('event_id', exactEventId).eq('is_active', true);
        
        if (braceletsData) {
          let lowBatteryCount = braceletsData.filter(b => b.bracelet?.battery_level < 20).length;
          setStats(prev => ({ ...prev, activeBracelets: braceletsData.length, lowBatteryWarnings: lowBatteryCount }));
          setActiveBraceletsList(braceletsData);
        } else {
          setActiveBraceletsList([]);
        }
      };

      fetchActiveSessions();
      // Poll every 4 seconds so if a Parent ends a session, the Organizer instantly sees it disappear
      pollTimer = setInterval(fetchActiveSessions, 4000); 
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [selectedEventId, events]);

  const handleSaveZone = async () => {
    if (!currentEvent) return;
    try {
      const exactEventId = currentEvent.event_id || currentEvent.id;
      const idColumnName = currentEvent.event_id ? 'event_id' : 'id';
      const { error } = await supabase.from('event').update({ geofence_coordinates: { lat: zoneCenter[0], lng: zoneCenter[1], radius: zoneRadius } }).eq(idColumnName, exactEventId);
      if (error) throw error;
      alert("Map layout saved! Parents will instantly see the new zone.");
      setIsMapLocked(true); 
    } catch (err) { alert("Error saving map: " + err.message); }
  };

  const handleGetMyLocation = () => {
    setIsLocating(true); 
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setZoneCenter([position.coords.latitude, position.coords.longitude]); setIsLocating(false); },
        (error) => { alert("GPS unavailable. Teleporting to demo location."); setZoneCenter([28.4342, 45.9636]); setIsLocating(false); },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 } 
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleEndEvent = async () => { 
    if (!currentEvent) return;
    if (!window.confirm(`Are you sure you want to completely DELETE "${currentEvent.event_name}" from the system?`)) return;
    try {
      const exactEventId = currentEvent.event_id || currentEvent.id;
      const idColumnName = currentEvent.event_id ? 'event_id' : 'id';
      const { error } = await supabase.from('event').delete().eq(idColumnName, exactEventId);
      if (error) throw error;
      const remainingEvents = events.filter(e => (e.event_id || e.id) !== exactEventId);
      setEvents(remainingEvents);
      if (remainingEvents.length > 0) setSelectedEventId(remainingEvents[0].event_id || remainingEvents[0].id);
      else { setSelectedEventId(''); setCurrentEvent(null); }
      alert("Event completely deleted!");
    } catch (err) { alert("Error deleting event. If there are still active children in this event, you must end their sessions first! Details: " + err.message); }
  };

  const getCustomDotIcon = (batteryLevel, isOutOfZone) => {
    let color = '#10b981'; // Green (Safe)
    let animation = 'none';

    if (batteryLevel <= 20 && batteryLevel > 0) color = '#f97316'; // Orange (Low Battery)
    
    if (batteryLevel === 0) {
      color = '#6b7280'; // Dead bracelets are Solid Grey
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

  const filteredEvents = events.filter(e => e.event_name.toLowerCase().includes(eventSearchQuery.toLowerCase()));

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
              <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>The following children have left the safe zone:</p>
              
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
            <div style={{ width: '100%' }}>
              <h2 className="page-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>{orgName} Console</h2>
              <p className="page-subtitle" style={{ margin: '0 0 20px 0', color: '#64748b' }}>Manage your events and track active bracelets.</p>
              
              {events.length > 0 && (
                <div className="action-button-group">
                  <div className="dropdown-wrapper" ref={dropdownRef}>
                    <div onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)} style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem', color: '#0f172a', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentEvent ? currentEvent.event_name : 'Choose an event...'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    {isEventDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: '0', right: '0', marginTop: '5px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden' }}>
                        <div style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}><input type="text" placeholder="🔍 Search..." value={eventSearchQuery} onChange={(e) => setEventSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()} /></div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                          {filteredEvents.map(ev => (
                            <li key={ev.event_id || ev.id} onClick={() => { setSelectedEventId(ev.event_id || ev.id); setIsEventDropdownOpen(false); setEventSearchQuery(''); }} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{ev.event_name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button onClick={() => navigate('/createEvent')} style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>+ New Event</button>
                  <button onClick={() => alert("Broadcasting mass SMS/Notification to all parents...")} style={{ padding: '12px 16px', backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '8px', color: '#a21caf', fontWeight: '600', cursor: 'pointer' }}>📢 Contact Parents</button>
                  {currentEvent && <button onClick={handleEndEvent} style={{ padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}>End Event</button>}
                </div>
              )}
            </div>
          </div>

          {loadingData ? <p style={{ color: '#64748b' }}>Loading dashboard data...</p> : events.length === 0 ? (
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', minHeight: '400px' }}>
              <span style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</span>
              <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>No Events Found</h3>
              <button onClick={() => navigate('/createEvent')} className="btn btn-primary" style={{ padding: '12px 24px', marginTop: '10px' }}>+ Create New Event</button>
            </div>
          ) : (
            <>
              <div className="top-metrics-row">
                <div className="metric-card"><div className="metric-icon-bg" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>👥</div><div><h4 className="metric-value">{stats.activeBracelets}</h4><p className="metric-label">Active Bracelets</p></div></div>
                <div className="metric-card"><div className="metric-icon-bg" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>🔋</div><div><h4 className="metric-value">{stats.lowBatteryWarnings}</h4><p className="metric-label">Low Battery</p></div></div>
                <div className="metric-card" style={{ borderColor: wanderingAlerts.length > 0 ? '#ef4444' : '#e2e8f0', backgroundColor: wanderingAlerts.length > 0 ? '#fef2f2' : '#fff' }}><div className="metric-icon-bg" style={{ backgroundColor: '#f8fafc', color: wanderingAlerts.length > 0 ? '#ef4444' : '#64748b' }}>⚠️</div><div><h4 className="metric-value" style={{ color: wanderingAlerts.length > 0 ? '#ef4444' : '#0f172a' }}>{stats.outOfZoneAlerts}</h4><p className="metric-label">Offline / Out of Zone</p></div></div>
              </div>

              <div className="dashboard-bottom-grid">
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="panel-title" style={{ margin: 0 }}>Event Overview Map</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: isMapLocked ? '#16a34a' : '#64748b', cursor: 'pointer', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" checked={isMapLocked} onChange={(e) => { setIsMapLocked(e.target.checked); if(e.target.checked) setFocusedLoc(null); }} style={{ cursor: 'pointer' }} />
                        {isMapLocked ? '🔒 Map Locked' : '🔓 Map Unlocked'}
                      </label>
                      
                      {focusedLoc && (
                        <button onClick={() => setFocusedLoc(null)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel Focus</button>
                      )}

                      {!isMapLocked && (
                        <>
                          <button onClick={handleGetMyLocation} disabled={isLocating} style={{ background: '#e0f2fe', border: 'none', color: '#0284c7', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: isLocating ? 'wait' : 'pointer' }}>
                            {isLocating ? '⏳...' : '📍 Locate Me'}
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Radius:</span>
                            <input type="range" min="10" max="500" value={zoneRadius} onChange={(e) => setZoneRadius(Number(e.target.value))} style={{ width: '80px' }} />
                            <button onClick={handleSaveZone} style={{ background: '#16a34a', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>💾 Save Edit</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div ref={mapSectionRef} className="map-wrapper" style={{ border: isMapLocked ? '3px solid #10b981' : '1px solid #e2e8f0' }}>
                    <MapContainer center={zoneCenter} zoom={18} zoomControl={!isMapLocked} style={{ height: '100%', width: '100%', backgroundColor: '#f4f7f6', cursor: isMapLocked ? 'default' : 'grab' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                      
                      <MapController center={zoneCenter} radius={zoneRadius} isLocked={isMapLocked} focusedLoc={focusedLoc} />
                      <MapClickListener setZoneCenter={setZoneCenter} isLocked={isMapLocked} />
                      
                      <Circle center={zoneCenter} radius={zoneRadius} pathOptions={{ color: wanderingAlerts.length > 0 ? '#ef4444' : '#10b981', fillColor: wanderingAlerts.length > 0 ? '#fecaca' : '#d1fae5', fillOpacity: 0.2, weight: 2, dashArray: '5, 5' }} />
                      
                      {activeBraceletsList.map(session => {
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
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div> Active</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> Out of Zone</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#f97316' }}></div> Low Battery</div>
                      <div className="legend-item"><div className="legend-dot" style={{ background: '#6b7280' }}></div> Offline (0%)</div>
                    </div>
                  </div>
                </div>

                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '560px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 className="panel-title">Bracelet Status</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate('/editBracelets')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', color: '#475569', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>⚙️ Manage</button>
                      <button onClick={() => navigate('/addBracelet')} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {activeBraceletsList.length > 0 ? activeBraceletsList.map((session) => {
                      const batLevel = session.bracelet?.battery_level || 0;
                      let batColor = '#10b981'; 
                      if (batLevel <= 20) batColor = '#f97316'; 
                      if (batLevel === 0) batColor = '#6b7280'; 

                      return (
                        <div key={session.session_id} className="bracelet-list-item">
                          <div>
                            <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{session.children?.name || 'Unknown Child'}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{session.bracelet?.mac_address}</span>
                          </div>
                          <div className="battery-pill" style={{ backgroundColor: batColor }}>{batLevel}%</div>
                        </div>
                      )
                    }) : <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>No hardware paired.</p>}
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

export default OrganizerDashboard;