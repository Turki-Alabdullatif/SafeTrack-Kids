import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [eventName, setEventName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Backend State
  const [organizerId, setOrganizerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(''); // Start empty!

  useEffect(() => {
    // 1. Kick out unauthorized users
    if (!user) {
      navigate('/loginCard');
      return;
    }

    // 2. Exact same bulletproof fetch used in your Dashboard
    const fetchMyOrganizerId = async () => {
      try {
        const { data, error } = await supabase
          .from('organizer')
          .select('organizer_id')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setOrganizerId(data.organizer_id);
          setDbError(''); // Clear any errors
        }
      } catch (err) {
        console.error("Error fetching Organizer ID:", err);
        setDbError('Error syncing profile: ' + err.message);
      }
    };

    fetchMyOrganizerId();
  }, [user, navigate]);

  async function handleCreateEvent(e) {
    e.preventDefault();
    
    if (!eventName || !locationName || !startTime || !endTime) {
      alert('Please fill out all the fields (Name, Location, Start, and End Time) before creating the event.');
      return;
    }

    if (!organizerId) {
      alert('Still syncing your Organizer profile. Please wait a second and try again.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      alert('The End Time must be AFTER the Start Time.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('event')
        .insert([
          {
            event_name: eventName,
            location_name: locationName,
            start_time: new Date(startTime).toISOString(), 
            end_time: new Date(endTime).toISOString(),     
            status: 'Active',                              
            organizer_id: organizerId,                     
          },
        ]);

      if (error) throw error;
      
      // Success! Teleport them back to the dashboard
      navigate('/organizerDashboard');
      
    } catch (err) {
      alert('Error creating event: ' + err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', backgroundColor: '#f3f7ff', overflowY: 'auto' }}>
        
        <div className="auth-container" style={{ margin: 'auto', width: '100%', maxWidth: '550px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '5px' }}>Create New Event</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '15px' }}>Set up the details for your upcoming gathering.</p>
          
          {/* Only shows if there is an actual error */}
          {dbError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {dbError}
            </div>
          )}
          
          <form className="form" onSubmit={handleCreateEvent}>
            
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Event Name</label>
              <input
                type="text"
                placeholder="e.g. Summer School Field Trip"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Location Name</label>
              <input
                type="text"
                placeholder="e.g. King Abdullah Park"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: '1 1 200px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
              
              <div style={{ flex: '1 1 200px', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#fff' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                boxSizing: 'border-box',
                backgroundColor: loading ? '#94a3b8' : '#2563eb', 
                color: '#fff',
                cursor: loading ? 'wait' : 'pointer'
              }} 
              disabled={loading}
            >
              {loading ? 'Starting Event...' : 'Create Event & Proceed to Map'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/organizerDashboard')} 
              style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '500', boxSizing: 'border-box' }}
            >
              Cancel
            </button>
            
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default CreateEvent;