import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const prof = await api.get('/users/profile');
      setMe(prof.data.user);
      const myPosts = await api.get('/users/me/posts');
      setPosts(myPosts.data.data);
      try {
        const evRes = await api.get('/events/me/history');
        setMyEvents(evRes.data.data || []);
      } catch (e) {
        // ignore silently for now
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard card">
      <h2>Hello, {user?.name}</h2>
      <div className="stack" style={{ marginTop: 8 }}>
        <div className="card" style={{ padding: 12, background: '#f3f7ff', maxWidth: '900px' }}>
          {!editing && (
            <>
              <h3 style={{ marginTop: 0 }}>Profile</h3>
              <div className="row" style={{ gap: 16, alignItems: 'center' }}>
                <div className="avatar avatar--lg">
                  {me?.avatarUrl ? <img alt="avatar" src={me.avatarUrl} /> : (me?.name?.[0] || 'U')}
                </div>
                <div className="stack" style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{me?.name || 'Not given'}</div>
                </div>
                <button className="btn" onClick={() => setEditing(true)}>Edit profile</button>
              </div>
              <div className="row" style={{ gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px' }}>Email: {me?.email || 'Not given'}</div>
              </div>
              <div className="row" style={{ gap: 16, marginTop: 8 }}>
                <div style={{ flex: 1 }}>Website: {me?.website || 'Not given'}</div>
                <div style={{ flex: 1 }}>Bio: {me?.bio || 'Not given'}</div>
              </div>
            </>
          )}

          {editing && (<>
          <h3>Edit profile</h3>
          <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
            <div className="stack" style={{ flex: 1 }}>
              <label>Name</label>
              <input className="input" value={me?.name || ''} onChange={(e) => setMe({ ...me, name: e.target.value })} />
            </div>
            <div className="stack" style={{ flex: 1 }}>
              <label>Username</label>
              <input className="input" value={me?.username || ''} onChange={(e) => setMe({ ...me, username: e.target.value })} />
            </div>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <div className="stack" style={{ flex: 1 }}>
              <label>Email</label>
              <input className="input" value={me?.email || ''} onChange={(e) => setMe({ ...me, email: e.target.value })} />
            </div>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <div className="stack" style={{ flex: 1 }}>
              <label>Bio</label>
              <input className="input" value={me?.bio || ''} onChange={(e) => setMe({ ...me, bio: e.target.value })} />
            </div>
            <div className="stack" style={{ flex: 1 }}>
              <label>Location</label>
              <input className="input" value={me?.location || ''} onChange={(e) => setMe({ ...me, location: e.target.value })} />
            </div>
          </div>
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <div className="stack" style={{ flex: 1 }}>
              <label>Website</label>
              <input className="input" value={me?.website || ''} onChange={(e) => setMe({ ...me, website: e.target.value })} />
            </div>
            <div className="stack" style={{ width: 220 }}>
              <label>Avatar</label>
              <input type="file" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                const res = await api.post('/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setMe({ ...me, avatarUrl: res.data.file.url });
              }} />
              {me?.avatarUrl && (
                <button className="btn btn--secondary" onClick={() => setMe({ ...me, avatarUrl: '' })}>Remove avatar</button>
              )}
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" disabled={saving} onClick={async () => {
              setSaving(true);
              const payload = { name: me?.name, username: me?.username, bio: me?.bio, location: me?.location, website: me?.website, avatarUrl: me?.avatarUrl };
              await api.put('/users/profile', payload);
              setSaving(false);
              setEditing(false);
              if (window.__addToast) window.__addToast('Profile updated','success');
            }}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
          </>)}
        </div>
        <button className="btn btn--secondary" style={{ padding: '6px 10px', maxWidth: 140 }} onClick={async () => {
          if (!window.confirm('Delete your account?')) return;
          await api.delete('/users/profile');
          if (window.__addToast) window.__addToast('Account deleted','success');
          window.location.href = '/';
        }}>Delete account</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Your posts</h3>
      <div className="stack card" style={{ padding: 12, background: '#fef6f0' }}>
        {posts.map((p) => (
          <Link key={p._id} to={`/posts/${p._id}`} className="post card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="row" style={{ alignItems: 'center', gap: 8 }}>
              <div className="avatar">
                {me?.avatarUrl ? <img alt="avatar" src={me.avatarUrl} /> : (me?.name?.[0] || 'U')}
              </div>
              <h4 style={{ margin: 0 }}>{p.title}</h4>
            </div>
            <div>{p.content.slice(0, 120)}{p.content.length > 120 ? '…' : ''}</div>
          </Link>
        ))}
      </div>

      <h3 style={{ marginTop: 16 }}>Your events</h3>
      <div className="stack card" style={{ padding: 12, background: '#f3f7ff' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>History</div>
          <Link to="/events/create" className="btn">Create Event</Link>
        </div>
        {myEvents.length === 0 ? (
          <div>No events created yet.</div>
        ) : (
          myEvents.map((ev) => (
            <Link key={ev._id} to={`/events/${ev._id}`} className="post card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                <h4 style={{ margin: 0 }}>{ev.title}</h4>
              </div>
              <div style={{ color: '#666' }}>{new Date(ev.date).toLocaleString()}</div>
              {ev.location && <div>Location: {ev.location}</div>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

