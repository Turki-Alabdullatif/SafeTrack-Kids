import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role },
      },
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
      setName('');
      setTimeout(() => navigate('/'), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="register-container auth-container">
        <h2 className="page-title">Check your email</h2>
        <p className="page-subtitle">
          We sent a confirmation link to your email. Click it to activate your account, then you can log in.
        </p>
        <p className="auth-link">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className='register-card'>
    <div className="register-container auth-container">
      <h2 className="page-title">Create an account</h2>
      <p className="page-subtitle">User</p>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <form className="form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email address"
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
          minLength={6}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="Account role"
        >
          <option value="parent">Parent</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="auth-link">
        Already have an account? <Link to="/loginCard">Log in</Link>
      </p>
    </div>
    </div>
  );
}

export default Register;
