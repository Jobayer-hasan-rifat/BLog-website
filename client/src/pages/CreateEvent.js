import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      setError('Please provide title, description and date');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/events', form);
      navigate(`/events/${res.data.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2>Create Event</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={onSubmit} className="stack" style={{ gap: 12, maxWidth: 640 }}>
        <div className="stack">
          <label>Title</label>
          <input name="title" className="input" value={form.title} onChange={onChange} />
        </div>
        <div className="stack">
          <label>Description</label>
          <textarea name="description" className="input" rows={5} value={form.description} onChange={onChange} />
        </div>
        <div className="row" style={{ gap: 12 }}>
          <div className="stack" style={{ flex: 1 }}>
            <label>Date & Time</label>
            <input type="datetime-local" name="date" className="input" value={form.date} onChange={onChange} />
          </div>
          <div className="stack" style={{ flex: 1 }}>
            <label>Location (optional)</label>
            <input name="location" className="input" value={form.location} onChange={onChange} />
          </div>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Creating…' : 'Create Event'}</button>
          <button type="button" className="btn btn--secondary" onClick={() => navigate('/events')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
