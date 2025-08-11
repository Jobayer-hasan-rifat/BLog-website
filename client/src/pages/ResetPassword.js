import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel card">
        <h2>Reset password</h2>
        {done ? (
          <p>Password updated. Redirecting to login…</p>
        ) : (
          <form onSubmit={submit} className="stack">
            {error && <div className="auth__error">{error}</div>}
            <div className="stack">
              <label>New password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;


