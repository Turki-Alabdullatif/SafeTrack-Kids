import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Ask Supabase to send the password reset email
    // It will redirect the user back to the /update-password page after they click the email link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email! We sent you a link to reset your password.');
    }
    
    setLoading(false);
  };

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
      <Header />
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="auth-container" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
              ✉️
            </div>
          </div>

          <h2 className="page-title" style={{ textAlign: 'center', margin: '0 0 5px 0' }}>Reset Password</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px', color: '#64748b' }}>
            Enter your email address and we will send you a link to reset your password.
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

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' }}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/loginCard" style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
              ← Back to Login
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ForgotPassword;