import React, { useState } from 'react';
import api from '../services/api';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel card">
        <h2>Forgot password</h2>
        {sent ? (
          <p>Check your email for a reset link.</p>
        ) : (
          <form onSubmit={submit} className="stack">
            <div className="stack">
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


