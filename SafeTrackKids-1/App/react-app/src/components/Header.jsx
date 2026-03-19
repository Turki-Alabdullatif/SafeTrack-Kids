import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

const NAV_LINKS = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features',     href: '/#features' },
  { label: 'Privacy',      href: '/#privacy' },
];

export default function Header() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const [settingsOpen, setSettingsOpen] = useState(false); 
  
  // Reference to hold our 5-second timer
  const settingsTimeoutRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user ? (user.user_metadata?.full_name || 'User') : 'Guest';
  const userRole = user?.user_metadata?.role; // 'Parent' or 'Organizer'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    navigate('/loginCard');
  };

  const handleNavigation = (path) => {
    setDropdownOpen(false);
    setSettingsOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  // --- Timer Logic for Settings Menu ---
  const handleSettingsMouseLeave = () => {
    settingsTimeoutRef.current = setTimeout(() => {
      setSettingsOpen(false);
    }, 5000); 
  };

  const handleSettingsMouseEnter = () => {
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
  };

  return (
    <>
      {/* NEW: Embedded Responsive CSS 
        This guarantees the buttons layout perfectly on mobile without needing to touch your index.css!
      */}
      <style>{`
        .header-controls-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-dashboard-btn {
          margin-left: 20px;
          padding: 8px 16px;
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
        }
        @media (max-width: 850px) {
          .nav-dashboard-btn {
            margin-left: 0;
            margin-top: 15px;
            width: 100%;
            display: block;
            text-align: center;
          }
          .header-logo-text {
            font-size: 1.1rem !important; /* Shrink logo slightly on mobile to fit the settings gear */
          }
          .mobile-safe-dropdown {
            position: fixed !important;
            top: 75px !important;
            right: 15px !important;
            width: calc(100% - 30px) !important;
            max-width: 320px !important;
            z-index: 9999 !important;
          }
          .mobile-safe-settings {
            left: 15px !important;
            right: auto !important;
          }
        }
      `}</style>

      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="container header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          
          {/* LEFT SIDE: SETTINGS & LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* 1. SETTINGS GEAR MENU */}
            {user && (
              <div 
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', zIndex: 101 }}
                onMouseEnter={handleSettingsMouseEnter}
                onMouseLeave={handleSettingsMouseLeave}
              >
                <button 
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '50%', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  aria-label="Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>

                {settingsOpen && (
                  <div className="mobile-safe-dropdown mobile-safe-settings" style={{ position: 'absolute', top: '50px', left: '0', width: '220px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', padding: '16px', zIndex: 100 }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      Account Settings
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        onClick={() => handleNavigation('/updateProfile')} 
                        style={{ width: '100%', padding: '10px', fontSize: '0.85rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: '#334155', fontWeight: '500', transition: '0.2s' }}
                      >
                        Update Profile
                      </button>
                      <button style={{ width: '100%', padding: '10px', fontSize: '0.85rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'not-allowed', textAlign: 'left', color: '#94a3b8', fontWeight: '500' }}>
                        Notifications (Coming Soon)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Main Logo */}
            <Link to="/" className="header-logo" onClick={() => setMenuOpen(false)}>
              <div className="header-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff" opacity="0.9"/>
                  <circle cx="12" cy="9" r="2.5" fill="#0ea5e9"/>
                </svg>
              </div>
              <span className="header-logo-text" style={{ whiteSpace: 'nowrap' }}>
                SafeTrack <span>Kids</span>
              </span>
            </Link>

          </div>

          {/* RIGHT SIDE: Navigation & Controls */}
          <div className="header-controls-container">
            
            {/* The Collapsible Menu (Links + Dashboard Button) */}
            <nav className={`header-nav ${menuOpen ? 'header-nav--open' : ''}`}>
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} className="header-nav-link" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}

              {/* DASHBOARD BUTTON - Safely tucked inside the Nav so it formats perfectly on mobile! */}
              {user && (
                <button 
                  onClick={() => handleNavigation(userRole === 'Organizer' ? '/organizerDashboard' : '/parentDashboard')}
                  className="btn btn-primary nav-dashboard-btn"
                >
                  {userRole === 'Organizer' ? 'Organizer Console' : 'Parent Dashboard'}
                </button>
              )}
            </nav>

            {/* USER AVATAR - Moved OUTSIDE the collapsible nav so it is always visible! */}
            <div 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}
              onMouseLeave={() => setDropdownOpen(false)} 
            >
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center' }}
                aria-label="User menu"
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e5edff', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #bfdbfe', transition: 'all 0.2s' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </button>

              {dropdownOpen && (
                <div className="mobile-safe-dropdown" style={{ position: 'absolute', top: '55px', right: '0', minWidth: '240px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', padding: '8px', zIndex: 100 }}>
                  
                  <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #bfdbfe' }}>
                      <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '16px' }}>
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {userName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                        {userRole} Account
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '0 4px' }}>
                    {user ? (
                      <button 
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '10px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleNavigation('/loginCard')}
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '10px 12px', fontSize: '0.9rem', borderRadius: '8px' }}
                      >
                        Log In
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* HAMBURGER MENU TOGGLE */}
            <button className="header-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" style={{ marginLeft: '5px' }}>
              <span /><span /><span />
            </button>
            
          </div>
        </div>
      </header>
    </>
  );
}