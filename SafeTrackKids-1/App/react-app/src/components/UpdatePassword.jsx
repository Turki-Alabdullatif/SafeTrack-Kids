import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';

function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Tell Supabase to update the password for the currently authenticated user
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      // Wait 2 seconds so they can read the success message, then push to login
      setTimeout(() => {
        navigate('/loginCard');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="auth-container" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
              🔐
            </div>
          </div>

          <h2 className="page-title" style={{ textAlign: 'center', margin: '0 0 5px 0' }}>Update Password</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px', color: '#64748b' }}>
            Please enter your new password below.
          </p>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' }}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save New Password'}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UpdatePassword;