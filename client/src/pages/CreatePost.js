import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/posts';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await createPost(form);
      navigate(`/posts/${created._id}`);
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create card">
      <h2>New Post</h2>
      {error && <div className="auth__error">{error}</div>}
      <form onSubmit={handleSubmit} className="stack">
        <div className="stack">
          <label>Title</label>
          <input className="input" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="stack">
          <label>Content</label>
          <textarea className="input" name="content" rows="8" value={form.content} onChange={handleChange} required />
        </div>
        <button className="btn" disabled={loading}>{loading ? 'Publishing...' : 'Publish'}</button>
      </form>
    </div>
  );
};

export default CreatePost;


