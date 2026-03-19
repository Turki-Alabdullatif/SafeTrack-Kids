import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function RegisterChild() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  
  // We don't need an array of parents anymore, just this specific parent's DB ID
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Grab the parent's name from their active session
  const parentName = user?.user_metadata?.full_name || 'Loading...';

  useEffect(() => {
    // 1. Kick out unauthorized users
    if (!user) {
      navigate('/loginCard');
      return;
    }

    // 2. Fetch only THIS parent's database ID using their secure Auth UUID
    async function fetchMyParentId() {
      const { data, error } = await supabase
        .from('parent')
        .select('parent_id')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setParentId(data.parent_id);
      }
    }
    fetchMyParentId();
  }, [user, navigate]);

  async function handleRegister(e) {
    e.preventDefault();
    
    if (!parentId) {
      alert('We could not find your parent profile. Please try logging in again.');
      return;
    }

    setLoading(true);

    // Insert into the database using the exact column names from your schema
    const { error } = await supabase
      .from('children')
      .insert([
        {
          name: name,
          age: parseInt(age, 10),
          medical_notes: medicalNotes || null,
          parent_id: parentId, // Automatically link the child to the logged-in parent!
        },
      ]);

    if (error) {
      alert('Error adding child: ' + error.message);
      setLoading(false);
    } else {
      // Clear form and send them back to their dashboard to see the new child!
      alert('Child registered successfully!');
      navigate('/parentDashboard');
    }
  }

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {/* flex: 1 pushes the footer to the bottom, display: flex centers the form */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', backgroundColor: '#f3f7ff' }}>
        
        <div className="auth-container" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '5px' }}>Register a Child</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px' }}>Add a child to your SafeTrack family.</p>
          
          <form className="form" onSubmit={handleRegister}>
            
            {/* Read-Only Parent Name Field */}
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Parent Name</label>
              <input
                type="text"
                value={parentName}
                disabled
                style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Child's Name</label>
              <input
                type="text"
                placeholder="e.g. Ahmad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Age</label>
              <input
                type="number"
                placeholder="e.g. 8"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="16"
                required
              />
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Medical Notes (Optional)</label>
              <textarea
                placeholder="e.g. Asthma, allergies, etc."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !parentId}>
              {loading ? 'Registering...' : 'Register Child'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/parentDashboard')} 
              style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '500' }}
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

export default RegisterChild;