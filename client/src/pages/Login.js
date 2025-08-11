import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel card">
        <h2>Welcome back</h2>
        <p className="auth__hint">Login as User or Admin with the same form.</p>
        {error && <div className="auth__error">{error}</div>}
        <form onSubmit={handleSubmit} className="stack">
          <div className="stack">
            <label>Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="stack">
            <label>Password</label>
            <div className="row" style={{ gap: 8 }}>
              <input className="input" name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handleChange} required />
              <button type="button" className="btn btn--secondary" onClick={() => setShow((v) => !v)}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <button className="btn" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
          <div>
            <a href="/forgot-password">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;


