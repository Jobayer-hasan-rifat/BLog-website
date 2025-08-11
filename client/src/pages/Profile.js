import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/profile');
        const u = data.user;
        setForm((f) => ({ ...f, name: u.name || '', username: u.username || '', email: u.email || '' }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/users/profile', form);
      setMessage('Profile updated');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    await api.delete('/users/profile');
    window.location.href = '/';
  };

  if (loading) return null;

  return (
    <div className="profile card">
      <h2>My Profile</h2>
      {message && <div className="profile__msg">{message}</div>}
      <form onSubmit={save} className="stack">
        <div className="stack">
          <label>Name</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="stack">
          <label>Username</label>
          <input className="input" name="username" value={form.username} onChange={handleChange} />
        </div>
        <div className="stack">
          <label>Email</label>
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} />
        </div>
        <hr />
        <div className="row">
          <div className="stack" style={{ flex: 1 }}>
            <label>Current password</label>
            <input className="input" type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />
          </div>
          <div className="stack" style={{ flex: 1 }}>
            <label>New password</label>
            <input className="input" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />
          </div>
        </div>
        <div className="row">
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" className="btn btn--secondary" onClick={remove}>Delete account</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;


