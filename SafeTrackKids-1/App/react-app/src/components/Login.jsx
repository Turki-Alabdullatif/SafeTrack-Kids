import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import '../styles/App.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMessage(null); 

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message); 
      setLoading(false);
      return; 
    } 
    
    if (data?.user) {
      console.log("Logged in successfully!", data.user);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        navigate('/dashboard'); 
      } else {
        if (userData.role === 'Organizer') {
          navigate('/OrganizerDashboard');
        } else {
          navigate('/ParentDashboard');
        }
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="page-layout-wrapper">
      
      <main className="main-content-grow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="auth-container" style={{ margin: 'auto', width: '100%', maxWidth: '450px', backgroundColor: '#fff', padding: 'clamp(20px, 5vw, 35px)', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 className="page-title" style={{ textAlign: 'center' }}>Welcome Back</h2>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: '25px' }}>Sign in to SafeTrack Kids</p>

          {errorMessage && (
            <div className="error-message" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}

          <form className="form" onSubmit={handleLogin}>
            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
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
            
            <div style={{ textAlign: 'left', marginBottom: '25px' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' }}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Verifying...' : 'Log In'}
            </button>
          </form>
          
          {/* LINK CONTAINER */}
          <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="auth-link" style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Don&apos;t have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
            </p>
            
            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

        </div>
      </main>
      
    </div>
  );
}

export default Login;