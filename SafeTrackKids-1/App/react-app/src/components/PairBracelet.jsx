import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function PairBracelet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [myChildren, setMyChildren] = useState([]);
  const [allBracelets, setAllBracelets] = useState([]); 

  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedBracelet, setSelectedBracelet] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/loginCard');
      return;
    }

    async function fetchParentData() {
      try {
        setLoading(true);
        
        // A. Get Parent ID
        const { data: parentData, error: parentError } = await supabase
          .from('parent')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (parentError) throw parentError;
        const parentId = parentData.parent_id || parentData.Parent_ID || parentData.id;

        // B. Fetch Children
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentId);
          
        if (childrenError) throw childrenError;

        // C. Check which children are ALREADY in an active session!
        let busyChildIds = [];
        if (childrenData && childrenData.length > 0) {
          const kidIds = childrenData.map(k => k.child_id || k.id);
          const { data: activeSessionsData } = await supabase
            .from('active_sessions')
            .select('child_id')
            .in('child_id', kidIds)
            .eq('is_active', true);
            
          if (activeSessionsData) {
            busyChildIds = activeSessionsData.map(s => s.child_id);
          }
        }

        // Tag the children so we can disable them in the dropdown
        const childrenWithStatus = (childrenData || []).map(child => ({
          ...child,
          isBusy: busyChildIds.includes(child.child_id || child.id)
        }));

        setMyChildren(childrenWithStatus);

        // D. Fetch Events (Only Active ones)
        const { data: eventsData, error: eventsError } = await supabase
          .from('event')
          .select('*')
          .eq('status', 'Active');
          
        if (eventsError) throw eventsError;
        setEvents(eventsData || []);

        // E. Fetch ALL hardware, filter out Dead/Assigned ones in JavaScript!
        const { data: braceletsData, error: braceletsError } = await supabase
          .from('bracelet')
          .select('*');
          
        if (braceletsError) throw braceletsError;
        
        const availableBracelets = (braceletsData || []).filter(b => {
          const isAvailable = b.status === 'Available' || String(b.status).trim() === 'Available';
          const hasBattery = b.battery_level > 0; // Must have at least 1% battery!
          return isAvailable && hasBattery;
        });

        setAllBracelets(availableBracelets);

      } catch (err) {
        console.error("Fetch Error:", err);
        setDbError('Database Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParentData();
  }, [user, navigate]);

  async function handlePairing(e) {
    e.preventDefault();
    
    if (!selectedEvent || !selectedChild || !selectedBracelet) {
      alert('Please fill out all fields to activate the tracker.');
      return;
    }

    setSubmitLoading(true);

    try {
      const currentTime = new Date().toISOString();

      const { error: sessionError } = await supabase
        .from('active_sessions')
        .insert([
          {
            event_id: selectedEvent,
            child_id: selectedChild,
            bracelet_id: selectedBracelet,
            is_active: true, 
            check_in_time: currentTime
          },
        ]);

      if (sessionError) throw sessionError;

      const targetBracelet = allBracelets.find(b => (b.bracelet_id || b.Bracelet_id || b.id) == selectedBracelet);
      const exactIdCol = targetBracelet.bracelet_id ? 'bracelet_id' : (targetBracelet.Bracelet_id ? 'Bracelet_id' : 'id');

      await supabase
        .from('bracelet')
        .update({ status: 'Assigned' })
        .eq(exactIdCol, selectedBracelet);
      
      alert('Bracelet paired! Tracking is now active.');
      navigate('/parentDashboard'); 
      
    } catch (err) {
      alert('Error pairing bracelet: ' + err.message);
      setSubmitLoading(false);
    }
  }

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', backgroundColor: '#f3f7ff', overflowY: 'auto' }}>
        
        <div className="auth-container" style={{ margin: 'auto', width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#16a34a' }}>🔗</div>
          </div>
          
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '5px' }}>Pair Bracelet</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px' }}>Link a tracker to your child for an event.</p>
          
          {dbError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>{dbError}</div>
          )}

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>⏳ Loading available devices...</p>
          ) : myChildren.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#64748b', marginBottom: '15px' }}>You haven't registered any children yet!</p>
              <button onClick={() => navigate('/registerChild')} className="btn btn-primary" style={{ padding: '8px 16px' }}>Register a Child First</button>
            </div>
          ) : (
            <form className="form" onSubmit={handlePairing}>
              
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>1. Which child are you pairing?</label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Choose your child --</option>
                  
                  {/* FEATURE: Disable children who are already paired! */}
                  {myChildren.map((child) => (
                    <option 
                      key={child.child_id || child.id} 
                      value={child.child_id || child.id}
                      disabled={child.isBusy}
                    >
                      {child.name} {child.isBusy ? ' (Already Paired)' : ''}
                    </option>
                  ))}

                </select>
              </div>

              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>2. Select Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option key={ev.event_id || ev.id} value={ev.event_id || ev.id}>{ev.event_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>3. Bracelet MAC Address</label>
                  <span style={{ fontSize: '0.75rem', backgroundColor: allBracelets.length > 0 ? '#dcfce7' : '#fee2e2', color: allBracelets.length > 0 ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {allBracelets.length} Available
                  </span>
                </div>
                <select
                  value={selectedBracelet}
                  onChange={(e) => setSelectedBracelet(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select handed bracelet --</option>
                  {allBracelets.map((b) => {
                    const bId = b.bracelet_id || b.Bracelet_id || b.id;
                    return (
                      <option key={bId} value={bId}>{b.mac_address} (Batt: {b.battery_level}%)</option>
                    )
                  })}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '5px 0 0 0', fontStyle: 'italic' }}>
                  *Bracelets with 0% battery are hidden and cannot be paired.
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', backgroundColor: submitLoading ? '#94a3b8' : '#16a34a', color: '#fff', cursor: submitLoading ? 'wait' : 'pointer' }} 
                disabled={submitLoading || myChildren.length === 0 || allBracelets.length === 0}
              >
                {submitLoading ? 'Activating Tracker...' : 'Activate Tracking'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/parentDashboard')} 
                style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '500', boxSizing: 'border-box' }}
              >
                Cancel
              </button>
              
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PairBracelet;