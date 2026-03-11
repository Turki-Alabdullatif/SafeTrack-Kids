import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';

export function Login() {
  // State variables to track what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State variables for user feedback (loading spinners and errors)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // The function that runs when the user clicks "Log In"
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setLoading(true);
    setErrorMessage(null); // Clear any old errors

    // Supabase's built-in secure login function
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMessage(error.message); // e.g., "Invalid login credentials"
    } else {
      console.log("Logged in successfully!", data.user);
      // Here is where you would redirect them to the Dashboard
      // e.g., navigate('/dashboard'); if using React Router
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container auth-container">
      <h2 className="page-title">Welcome to SafeTrack Kids</h2>
      <p className="page-subtitle">User Login</p>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <form className="form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Log In'}
        </button>
      </form>
      <p className="auth-link">
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;