import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(form);
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__panel card">
        <h2>Create your account</h2>
        {error && <div className="auth__error">{error}</div>}
        <form onSubmit={handleSubmit} className="stack">
          <div className="stack">
            <label>Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="stack">
            <label>Email</label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="stack">
            <label>Password</label>
            <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
};

export default Register;


