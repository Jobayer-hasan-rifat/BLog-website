import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PostMenu from '../components/PostMenu';
import { toggleLikePost, fetchPosts, createComment, getComments } from '../services/posts';
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

  // State for comments
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data.map(post => ({ ...post, likedByUser: post.likedBy.includes(user?._id) })));
      } finally {
        setLoading(false);
      }
    };
    loadPosts();

    const onPostUpdated = (e) => {
      const { id, post } = e.detail || {};
      if (!id || !post) return;
      setPosts((list) => list.map((p) => (p._id === id ? { ...p, ...post } : p)));
    };
    window.addEventListener('post:updated', onPostUpdated);
    return () => window.removeEventListener('post:updated', onPostUpdated);
  }, [user]);

  const handleLike = async (postId) => {
    if (!user) return addToast('You must be logged in to like posts', 'error');
    try {
      const res = await toggleLikePost(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likesCount: res.likesCount, likedByUser: res.liked } : p));
    } catch (error) {
      addToast('Failed to like post', 'error');
    }
  };

  const handleToggleComments = async (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      try {
        const fetchedComments = await getComments(postId);
        setComments(prev => ({ ...prev, [postId]: fetchedComments }));
      } catch (error) {
        addToast('Failed to fetch comments', 'error');
      }
    }
  };

  const handleCreateComment = async (postId) => {
    if (!user) return addToast('You must be logged in to comment', 'error');
    if (!newComment.trim()) return;
    try {
      const createdComment = await createComment(postId, newComment);
      // Manually add author details to the new comment for instant UI update
      const commentWithAuthor = { ...createdComment, author: { _id: user._id, name: user.name, avatarUrl: user.avatarUrl } };
      setComments({ ...comments, [postId]: [...(comments[postId] || []), commentWithAuthor] });
      setPosts(posts.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      setNewComment('');
      addToast('Comment posted successfully', 'success');
    } catch (error) {
      addToast('Failed to post comment', 'error');
    }
  };

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
        {user && (
          <div className="feed__item feed__item--create">
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
          </div>
        )}
        {posts.map((post) => (
          <div key={post._id} className="feed__item card">
            <div className="feed__item-header">
              <div className="avatar">
                {post.author?.avatarUrl ? <img alt="avatar" src={post.author.avatarUrl} /> : (post.author?.name?.[0] || 'U')}
              </div>
              <div className="feed__item-info">
                <Link to={`/posts/${post._id}`} className="feed__title">{post.author?.name}</Link>
                <div className="feed__meta">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <PostMenu post={post} />
            </div>
            <div className="feed__content">
              <p>{post.content}</p>
              {post.attachments && post.attachments.length > 0 && (
                <div className="attachments">
                  {post.attachments.map(file => (
                    <img key={file.filename} src={file.url} alt={file.filename} />
                  ))}
                </div>
              )}
            </div>
            <div className="feed__stats">
              <span>{post.likesCount || 0} Likes</span>
              <span>{post.commentsCount || 0} Comments</span>
            </div>
            <div className="feed__actions">
              <button className={`btn-action ${post.likedByUser ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>Like</button>
              <button className="btn-action" onClick={() => handleToggleComments(post._id)}>Comment</button>
            </div>
            {showComments[post._id] && (
              <div className="comments-section">
                <div className="comment-input-container">
                  <div className="avatar small">
                    {user?.avatarUrl ? <img alt="avatar" src={user.avatarUrl} /> : (user?.name?.[0] || 'U')}
                  </div>
                  <input type="text" className="input" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post._id)} />
                  <button className="btn-icon" onClick={() => handleCreateComment(post._id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
                  </button>
                </div>
                <div className="comments-list">
                  {(comments[post._id] || []).map(comment => (
                    <div key={comment._id} className="comment">
                      <div className="avatar small">
                        {comment.author?.avatarUrl ? <img alt="avatar" src={comment.author.avatarUrl} /> : (comment.author?.name?.[0] || 'U')}
                      </div>
                      <div className="comment-content">
                        <span className="comment-author">{comment.author.name}</span>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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


