import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/posts';
import RichTextEditor from '../components/RichTextEditor';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    richContent: '',
    categories: [],
    tags: [],
    status: 'published'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleRichContentChange = (value) => {
    setForm({ ...form, richContent: value, content: value.replace(/<[^>]*>/g, '') });
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setForm({ ...form, tags });
  };

  const handleCategoriesChange = (e) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setForm({ ...form, categories });
  };

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

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    try {
      const draft = await createPost({ ...form, status: 'draft' });
      navigate('/dashboard/drafts');
    } catch (err) {
      setError('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h2>Create New Post</h2>
        <div className="post-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save as Draft
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input 
            id="title"
            className="form-input" 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="Enter your post title..."
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="categories">Categories (comma-separated)</label>
          <input 
            id="categories"
            className="form-input" 
            name="categories" 
            value={form.categories.join(', ')} 
            onChange={handleCategoriesChange} 
            placeholder="Technology, Programming, Web Development..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input 
            id="tags"
            className="form-input" 
            name="tags" 
            value={form.tags.join(', ')} 
            onChange={handleTagsChange} 
            placeholder="react, javascript, tutorial..."
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <RichTextEditor
            value={form.richContent}
            onChange={handleRichContentChange}
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;


