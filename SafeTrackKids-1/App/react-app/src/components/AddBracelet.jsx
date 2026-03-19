import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function AddBracelet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [macAddress, setMacAddress] = useState('');
  const [qrCodeString, setQrCodeString] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/loginCard');
    }
  }, [user, navigate]);

  async function handleAddBracelet(e) {
    e.preventDefault();
    
    if (!macAddress || !qrCodeString) {
      alert('Please fill out the MAC Address and the QR Code String.');
      return;
    }

    setSubmitLoading(true);

    try {
      const { error } = await supabase
        .from('bracelet')
        .insert([
          {
            mac_address: macAddress.toUpperCase(), 
            qr_code_string: qrCodeString,
            battery_level: parseInt(batteryLevel),
            // FIXED: Hardcoded to 'Available' matching your database ENUM exactly!
            status: 'Available' 
          },
        ]);

      if (error) throw error;
      
      alert('Hardware registered into inventory successfully!');
      
      // Clear the form for the next bracelet
      setMacAddress(''); 
      setQrCodeString('');
      setBatteryLevel(100);
      
      setSubmitLoading(false);
      
    } catch (err) {
      alert('Error adding hardware: ' + err.message);
      setSubmitLoading(false);
    }
  }

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 20px', backgroundColor: '#f3f7ff', overflowY: 'auto' }}>
        
        <div className="auth-container" style={{ margin: 'auto', width: '100%', maxWidth: '550px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#ecfeff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#0891b2' }}>
              ⌚
            </div>
          </div>
          
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '5px' }}>Register Hardware</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px' }}>Add a new tracking bracelet to your system inventory.</p>
          
          <form className="form" onSubmit={handleAddBracelet}>
            
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Bracelet MAC Address</label>
              <input
                type="text"
                placeholder="e.g. 00:1A:2B:3C:4D:5E"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>QR Code String</label>
              <input
                type="text"
                placeholder="e.g. BRAC-99384-XYZ"
                value={qrCodeString}
                onChange={(e) => setQrCodeString(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Starting Battery (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box', backgroundColor: submitLoading ? '#94a3b8' : '#2563eb', color: '#fff', cursor: submitLoading ? 'wait' : 'pointer' }} 
              disabled={submitLoading}
            >
              {submitLoading ? 'Registering...' : '+ Add to Inventory'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/organizerDashboard')} 
              style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '500', boxSizing: 'border-box' }}
            >
              Done / Return to Dashboard
            </button>
            
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AddBracelet;