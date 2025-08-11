import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/UserPublicProfile.css';

const UserPublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return null;
  if (!profile?.user) return <div className="card">User not found</div>;

  const { user, posts } = profile;
  return (
    <div className="public-profile">
      <div className="card">
        <h2>{user.name} {user.username ? `(@${user.username})` : ''}</h2>
        <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        {posts.map((p) => (
          <Link key={p._id} to={`/posts/${p._id}`} className="post card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{p.title}</h3>
            <p>{p.content.slice(0, 140)}{p.content.length > 140 ? '…' : ''}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserPublicProfile;


