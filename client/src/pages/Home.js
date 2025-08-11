import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PostMenu from '../components/PostMenu';
import { toggleLikePost } from '../services/posts';
import { fetchPosts } from '../services/posts';
import api from '../services/api';
import '../styles/Home.css';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [composer, setComposer] = useState({ title: '', content: '' });
  const [files, setFiles] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    };
    load();

    const onPostUpdated = (e) => {
      const { id, post } = e.detail || {};
      if (!id || !post) return;
      setPosts((list) => list.map((p) => (p._id === id ? { ...p, ...post } : p)));
    };
    window.addEventListener('post:updated', onPostUpdated);
    return () => window.removeEventListener('post:updated', onPostUpdated);
  }, []);

  if (loading) return null;

  return (
    <div className="home-layout">
      <aside className="sidebar left">
        <h3>Explore</h3>
        <ul>
          <li><Link to="/">Categories</Link></li>
          <li><Link to="/">Trending</Link></li>
          <li><Link to="/">About</Link></li>
          <li><Link to="/">Contact</Link></li>
        </ul>
      </aside>
      <main className="feed">
        {/* Inline composer - only for logged-in users */}
        {user && (<div className="card" style={{ padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Create a post</h3>
          <div className="stack">
            <input className="input" placeholder="Title" value={composer.title} onChange={(e) => setComposer({ ...composer, title: e.target.value })} />
            <textarea className="input" rows="4" placeholder="What's on your mind?" value={composer.content} onChange={(e) => setComposer({ ...composer, content: e.target.value })} />
            <div className="row">
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              <button className="btn" disabled={publishing} onClick={async () => {
                try {
                  setPublishing(true);
                  let attachments = [];
                  if (files.length) {
                    const fd = new FormData();
                    files.forEach((f) => fd.append('files', f));
                    const up = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    attachments = up.data.files;
                  }
                  const res = await api.post('/posts', { ...composer, attachments });
                  setPosts((p) => [res.data.data, ...p]);
                  setComposer({ title: '', content: '' });
                  setFiles([]);
                  addToast('Post published', 'success');
                } catch (e) {
                  console.error(e);
                  addToast('Failed to publish', 'error');
                } finally {
                  setPublishing(false);
                }
              }}>{publishing ? 'Publishing…' : 'Publish'}</button>
            </div>
          </div>
        </div>)}
        {posts.map((post) => (
          <div key={post._id} className="feed__item card" style={{ position: 'relative' }}>
            <div className="score">{post.likesCount || 0}</div>
            <div className="feed__body">
              <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                <div className="avatar">
                  {post.author?.avatarUrl ? <img alt="avatar" src={post.author.avatarUrl} /> : (post.author?.name?.[0] || 'U')}
                </div>
                <Link to={`/posts/${post._id}`} className="feed__title">{post.title}</Link>
              </div>
              <div className="feed__meta">By {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}</div>
              <div className="feed__excerpt">
                {post.content?.length > 180 ? (
                  <>
                    {post.content.slice(0, 180)}… <Link to={`/posts/${post._id}`}>View more</Link>
                  </>
                ) : post.content}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                <button className="btn btn--secondary" onClick={async () => {
                  try {
                    const res = await toggleLikePost(post._id);
                    // update local post state without reload
                    setPosts((list) => list.map((p) => p._id === post._id ? { ...p, likesCount: res.likesCount } : p));
                  } catch {}
                }}>Like</button>
                <div style={{ color: '#666', fontSize: 12 }}>Likes: {post.likesCount || 0}</div>
              </div>
            </div>
            {/* Three-dot menu placeholder (edit/delete for own posts) */}
            <PostMenu post={post} />
          </div>
        ))}
      </main>
      <aside className="sidebar right">
        <h3>Highlights</h3>
        <ul>
          <li><Link to="/">Most Liked</Link></li>
          <li><Link to="/">Leaderboard</Link></li>
          <li><Link to="/">Weekly Picks</Link></li>
        </ul>
      </aside>
    </div>
  );
};

export default Home;


