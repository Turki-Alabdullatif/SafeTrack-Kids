import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import '../styles/App.css';

function Register() {
  const [role, setRole] = useState('Parent'); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  
  const [parentName, setParentName] = useState(''); 
  const [parentPhone, setParentPhone] = useState(''); 
  
  const [orgName, setOrgName] = useState('');
  const [orgContactEmail, setOrgContactEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // 1. Pack the metadata dynamically based on the selected role
    let metaData = { role: role };
    if (role === 'Parent') {
      metaData.full_name = parentName;
      metaData.phone_number = parentPhone;
    } else {
      metaData.full_name = orgName;
      metaData.organization_name = orgName;
      metaData.contact_email = orgContactEmail;
    }

    // 2. Create the user in Auth (The Database Trigger handles the rest!)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: metaData },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false); 
      return;
    }

    if (data?.user) {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setParentName('');
      setParentPhone('');
      setOrgName('');
      setOrgContactEmail('');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="page-layout-wrapper">
        <Header />
        <main className="main-content-grow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="auth-container">
            <h2 className="page-title">Check your email</h2>
            <p className="page-subtitle">
              We sent a confirmation link to your email. Click it to activate your account, then you can log in.
            </p>
            <p className="auth-link">
              <Link to="/parentDashboard">Go to Dashboard</Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout-wrapper">
      <Header />
      <main className="main-content-grow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Removed the extra register-card wrapper so it stretches properly on desktop */}
        <div className="auth-container">
          <h2 className="page-title">Create an account</h2>
          <p className="page-subtitle">User Registration</p>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <form className="form" onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="Account role"
              >
                <option value="Parent">Parent</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Login Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {role === 'Parent' && (
              <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Turki Alabdullatif"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    maxLength={10}
                    minLength={10}
                    required
                  />
                </div>
              </div>
            )}

            {role === 'Organizer' && (
              <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Safe Events Co."
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Contact Email (Public)</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={orgContactEmail}
                    onChange={(e) => setOrgContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <p className="auth-link">
            Already have an account? <Link to="/loginCard">Log in</Link>
          </p>
        </div>

      </main>
      <Footer />
    </div>
  );
}

export default Register;