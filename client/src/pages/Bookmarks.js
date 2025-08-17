import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiTrash2, FiEdit3, FiExternalLink } from 'react-icons/fi';
import './Bookmarks.css';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setBookmarks(data.data);
      } else {
        setError('Failed to fetch bookmarks');
      }
    } catch (err) {
      setError('Error loading bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();

      if (data.success) {
        setBookmarks(bookmarks.filter(bookmark => bookmark.post._id !== postId));
      } else {
        setError('Failed to remove bookmark');
      }
    } catch (err) {
      setError('Error removing bookmark');
    }
  };

  const handleEditNote = (bookmark) => {
    setEditingNote(bookmark._id);
    setNoteText(bookmark.note || '');
  };

  const handleSaveNote = async (postId) => {
    try {
      const response = await fetch(`/api/bookmarks/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ note: noteText })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookmarks(bookmarks.map(bookmark => 
          bookmark.post._id === postId 
            ? { ...bookmark, note: noteText }
            : bookmark
        ));
        setEditingNote(null);
        setNoteText('');
      } else {
        setError('Failed to update note');
      }
    } catch (err) {
      setError('Error updating note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
  };

  if (loading) {
    return (
      <div className="bookmarks-container">
        <div className="loading-spinner">Loading bookmarks...</div>
      </div>
    );
  }

  return (
    <div className="bookmarks-container">
      <div className="bookmarks-header">
        <h2>
          <FiBookmark />
          My Bookmarks
        </h2>
        <span className="bookmarks-count">{bookmarks.length} saved posts</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <FiBookmark className="empty-icon" />
          <h3>No bookmarks yet</h3>
          <p>Start bookmarking posts you want to read later!</p>
          <Link to="/" className="btn-primary">
            Explore Posts
          </Link>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map(bookmark => (
            <div key={bookmark._id} className="bookmark-card">
              <div className="bookmark-content">
                <div className="post-info">
                  <Link to={`/posts/${bookmark.post._id}`} className="post-title">
                    {bookmark.post.title}
                  </Link>
                  <p className="post-excerpt">
                    {bookmark.post.content.substring(0, 200)}...
                  </p>
                  <div className="post-meta">
                    <span className="author">by {bookmark.post.author.name}</span>
                    <span className="date">
                      {new Date(bookmark.post.createdAt).toLocaleDateString()}
                    </span>
                    <div className="post-stats">
                      <span>{bookmark.post.likesCount} likes</span>
                      <span>{bookmark.post.commentsCount} comments</span>
                    </div>
                  </div>
                </div>

                <div className="bookmark-note">
                  {editingNote === bookmark._id ? (
                    <div className="note-editor">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a personal note..."
                        className="note-textarea"
                      />
                      <div className="note-actions">
                        <button 
                          onClick={() => handleSaveNote(bookmark.post._id)}
                          className="btn-save"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="note-display">
                      {bookmark.note ? (
                        <p className="note-text">"{bookmark.note}"</p>
                      ) : (
                        <p className="no-note">No note added</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bookmark-actions">
                <Link 
                  to={`/posts/${bookmark.post._id}`}
                  className="action-btn read-btn"
                  title="Read post"
                >
                  <FiExternalLink />
                </Link>
                <button
                  onClick={() => handleEditNote(bookmark)}
                  className="action-btn edit-btn"
                  title="Edit note"
                >
                  <FiEdit3 />
                </button>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.post._id)}
                  className="action-btn remove-btn"
                  title="Remove bookmark"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
