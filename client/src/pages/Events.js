import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await api.get('/events');
        setEvents(res.data.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2>Upcoming Events</h2>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : events.length === 0 ? (
        <p>No upcoming events.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {events.map(ev => (
            <li key={ev._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{ev.title}</strong>
                  <div style={{ color: '#666' }}>{new Date(ev.date).toLocaleString()}</div>
                </div>
                <Link className="btn" to={`/events/${ev._id}`}>View details</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Events;
