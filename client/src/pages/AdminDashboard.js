import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    };
    load();
  }, []);

  const removeUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers((u) => u.filter((x) => x._id !== id));
  };

  return (
    <div className="dashboard card">
      <h2>Admin Panel</h2>
      <p>Welcome, {user?.name}. You have administrative access.</p>

      <h3>Manage users</h3>
      <div className="stack">
        {users.map((u) => (
          <div key={u._id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{u.name} {u.username ? `(@${u.username})` : ''}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{u.email}</div>
            </div>
            <div className="row">
              <button className="btn" onClick={async () => {
                const name = window.prompt('Name', u.name || '');
                if (name === null) return;
                const username = window.prompt('Username', u.username || '');
                if (username === null) return;
                const res = await api.put(`/users/${u._id}`, { name, username });
                setUsers((list) => list.map((x) => x._id === u._id ? res.data.user : x));
              }}>Edit</button>
              <button className="btn btn--secondary" onClick={() => removeUser(u._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;


