import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="card" style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div className="card" style={{ padding: 16 }}><p className="error-message">{error}</p></div>;
  if (!event) return null;

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2>{event.title}</h2>
      <div style={{ color: '#666', marginBottom: 8 }}>{new Date(event.date).toLocaleString()}</div>
      {event.location && <div style={{ marginBottom: 8 }}>Location: {event.location}</div>}
      <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
      {event.user?.name && (
        <div style={{ marginTop: 12, color: '#666' }}>Created by {event.user.name}</div>
      )}
    </div>
  );
};

export default EventDetail;
