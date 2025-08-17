import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { AuthContext } from '../context/AuthContext';
import { DraftsContext } from '../context/DraftsContext';
import '../styles/Home.css';

const Comment = ({ comment, post, onLike, onReplySubmit, replyingTo, setReplyingTo, replyContent, setReplyContent }) => (
  <div className="comment">
    <div className="comment-content">
      <span className="comment-author">{comment.author?.name || 'User'}</span>
      <p>{comment.content}</p>
      <div className="comment-actions">
        <button onClick={() => onLike(post._id, comment._id)}>
          Like ({comment.likesCount || 0})
        </button>
        <button onClick={() => setReplyingTo({ postId: post._id, commentId: comment._id })}>
          Reply
        </button>
      </div>
      {replyingTo?.commentId === comment._id && (
        <div className="reply-input-container">
          <input 
            type="text" 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
          />
          <button onClick={() => onReplySubmit(post._id, comment._id)}>Submit</button>
        </div>
      )}
    </div>
    {comment.replies && comment.replies.length > 0 && (
      <div className="replies">
        {comment.replies.map(reply => (
          <Comment 
            key={reply._id} 
            comment={reply} 
            post={post} 
            onLike={onLike} 
            onReplySubmit={onReplySubmit}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
          />
        ))}
      </div>
    )}
  </div>
);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addDraft, removeDraft } = useContext(DraftsContext);
  // Composer state
  const [composer, setComposer] = useState({ id: null, title: '', content: '', feeling: '', location: '', media: null });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notification, setNotification] = useState(null);
  const location = useLocation();

  const handleCloseModal = () => {
    const hasContent = composer.title.trim() !== '' || composer.content.trim() !== '' || composer.feeling || composer.location || composer.media;
    if (hasContent) {
      setShowCancelConfirm(true);
    } else {
      setComposer({ title: '', content: '', feeling: '', location: '', media: null });
      setShowComposerModal(false);
    }
  };

  const handleSaveDraft = () => {
    addDraft(composer);
    setComposer({ title: '', content: '', feeling: '', location: '', media: null });
    setShowComposerModal(false);
    setShowCancelConfirm(false);
  };

  const handleDiscardPost = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setComposer({ title: '', content: '', feeling: '', location: '', media: null });
    setMediaPreview(null);
    setShowComposerModal(false);
    setShowCancelConfirm(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const feelingOptions = [
    { emoji: '😊', label: 'Happy' }, { emoji: '😢', label: 'Sad' }, { emoji: '😍', label: 'Loved' },
    { emoji: '😂', label: 'Laughing' }, { emoji: '🤔', label: 'Thinking' }, { emoji: '😎', label: 'Cool' },
    { emoji: '🥳', label: 'Partying' }, { emoji: '😴', label: 'Tired' }, { emoji: '😠', label: 'Angry' },
    { emoji: '🤯', label: 'Mind-blown' }, { emoji: '🤔', label: 'Curious' }, { emoji: '😇', label: 'Blessed' },
    { emoji: '🥳', label: 'Celebrating' }, { emoji: '🤪', label: 'Goofy' }, { emoji: '😥', label: 'Worried' },
    { emoji: '🤗', label: 'Hopeful' }, { emoji: '🥺', label: 'Emotional' }, { emoji: '🤓', label: 'Geeky' }
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      setShowComposerModal(true);
      
      // Check if we're editing a draft
      if (location.state?.draft) {
        const draft = location.state.draft;
        setComposer({
          id: draft.id, // Keep track of draft ID
          title: draft.title || '',
          content: draft.content || '',
          feeling: draft.feeling || '',
          location: draft.location || '',
          media: draft.media || null
        });
        
        // Clear the location state to prevent repeated loading
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    }
  }, [location]);

  // Load posts only when user is logged in
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/posts?limit=10&sortBy=latest', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          const items = Array.isArray(data.data) ? data.data : (data.data?.posts || []);
          setPosts(items);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [user]);

  const handlePostUpdate = (postId, updatedData) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId ? { ...post, ...updatedData } : post
      )
    );
  };

  const handleBookmarkUpdate = (postId, bookmarkData) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p._id === postId) {
          const updatedPost = { ...p, bookmarksCount: bookmarkData.bookmarksCount };
          const userId = user._id;

          const bookmarkedBy = Array.isArray(p.bookmarkedBy) ? [...p.bookmarkedBy] : [];

          if (bookmarkData.bookmarked) {
            if (!bookmarkedBy.includes(userId)) {
              bookmarkedBy.push(userId);
            }
          } else {
            const index = bookmarkedBy.indexOf(userId);
            if (index > -1) {
              bookmarkedBy.splice(index, 1);
            }
          }
          updatedPost.bookmarkedBy = bookmarkedBy;
          return updatedPost;
        }
        return p;
      })
    );
  };

  const handleReShare = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  // Submit a new post from the composer
  const submitPost = async () => {
    if (!user) {
      window.alert('Please log in to create a post');
      return;
    }
    if (!composer.title.trim() || !composer.content.trim()) return;
    try {
      setSubmitting(true);
      const { id, title, content, feeling, location, media } = composer;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('feeling', feeling);
      formData.append('location', location);
      if (media) {
        formData.append('media', media);
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data.data) {
        setPosts(prev => [data.data, ...prev]);
        if (id) {
          removeDraft(id);
        }
        if (mediaPreview) {
          URL.revokeObjectURL(mediaPreview);
        }
        setComposer({ id: null, title: '', content: '', feeling: '', location: '', media: null });
        setMediaPreview(null);
        setShowComposerModal(false);
        showNotification('Post created successfully!');
      } else {
        console.error('Failed to create post', data);
        showNotification(data?.message || 'Failed to create post', 'error');
      }
    } catch (e) {
      console.error('Create post error', e);
      showNotification('Failed to create post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="home-container-dark">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <LeftSidebar />
      <div className="main-feed">
          {user && (
            <div className="composer-card" onClick={() => setShowComposerModal(true)}>
              <div className="composer-row">
                <div className="avatar small">
                  {user?.avatarUrl ? (
                    <img alt="avatar" src={user.avatarUrl} />
                  ) : (
                    (user?.name?.[0] || 'U')
                  )}
                </div>
                <input
                  type="text"
                  className="composer-input"
                  placeholder={`What's on your mind, ${user?.name?.split(' ')?.[0] || 'there'}?`}
                  readOnly
                />
              </div>
              <div className="composer-actions">
                <button type="button" className="composer-action">Photo/video</button>
                <button 
                  type="button" 
                  className="composer-action"
                  onClick={() => setShowFeelingSelector(!showFeelingSelector)}
                >
                  {composer.feeling ? `${composer.feeling}` : 'Feeling/activity'}
                </button>
              </div>
              {showFeelingSelector && (
                <div className="feeling-selector">
                  <div className="feeling-options">
                    {feelingOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        className={`feeling-option ${composer.feeling === `${option.emoji} ${option.label}` ? 'selected' : ''}`}
                        onClick={() => {
                          setComposer({ ...composer, feeling: `${option.emoji} ${option.label}` });
                          setShowFeelingSelector(false);
                        }}
                      >
                        <span className="feeling-emoji">{option.emoji}</span>
                        <span className="feeling-label">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="clear-feeling"
                    onClick={() => {
                      setComposer({ ...composer, feeling: '' });
                      setShowFeelingSelector(false);
                    }}
                  >
                    Clear feeling
                  </button>
                </div>
              )}
            </div>
          )}
          {!user ? (
            <div className="no-posts">
              <h3>Welcome to MiniBlog</h3>
              <p>Please sign up or log in to view posts and events.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts yet</h3>
              <p>Be the first to share something amazing!</p>
              {user && <span>Use the composer above to create your first post.</span>}
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post._id}>
                  <PostCard
                    post={post}
                    onLike={handlePostUpdate}
                    onBookmark={handleBookmarkUpdate}
                    onReShare={handleReShare}
                    theme="light"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      {user && <RightSidebar />}

      {/* Create Post Modal */}
      {showComposerModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create post</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-user">
              <div className="avatar small">
                {user?.avatarUrl ? <img alt="avatar" src={user.avatarUrl} /> : (user?.name?.[0] || 'U')}
              </div>
              <div className="modal-user-info">
                <div className="name">{user?.name || 'User'}</div>
                <div className="visibility">Public ▾</div>
              </div>
            </div>
            <div className="modal-body">
              <input
                className="input"
                placeholder="Title"
                value={composer.title}
                onChange={(e) => setComposer({ ...composer, title: e.target.value })}
              />
              <textarea
                className="modal-textarea"
                placeholder="What's on your mind?"
                value={composer.content}
                onChange={(e) => setComposer({ ...composer, content: e.target.value })}
              />
              {mediaPreview && (
                <div className="media-preview">
                  <img src={mediaPreview} alt="Preview" />
                  <button 
                    className="remove-media-btn"
                    onClick={() => {
                      setComposer({ ...composer, media: null });
                      URL.revokeObjectURL(mediaPreview);
                      setMediaPreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              {composer.feeling && (
                <div className="selected-feeling">
                  <span>Feeling: {composer.feeling}</span>
                  <button 
                    type="button" 
                    onClick={() => setComposer({ ...composer, feeling: '' })}
                    className="remove-feeling"
                  >
                    ×
                  </button>
                </div>
              )}
              {composer.location && (
                <input 
                  type="text" 
                  className="modal-extra-input"
                  placeholder="Where are you?"
                  value={composer.location}
                  onChange={(e) => setComposer({ ...composer, location: e.target.value })}
                />
              )}
              <div className="modal-add-row">
                <span>Add to your post</span>
                <div className="add-actions">
                  <label className="add-action">
                    📷 Photo/Video
                    <input 
                      type="file" 
                      hidden 
                      accept="image/jpeg,image/png,image/jpg,video/mp4"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (mediaPreview) {
                            URL.revokeObjectURL(mediaPreview);
                          }
                          setComposer({ ...composer, media: file });
                          setMediaPreview(URL.createObjectURL(file));
                        }
                      }} 
                    />
                  </label>
                  <div className="add-action feeling-dropdown-container">
                    <button type="button" className="add-action" onClick={() => setShowFeelingSelector(!showFeelingSelector)}>😊 Feeling</button>
                    {showFeelingSelector && (
                      <div className="feeling-selector-modal">
                        {feelingOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            className="feeling-option"
                            onClick={() => {
                              setComposer({ ...composer, feeling: `${option.emoji} ${option.label}` });
                              setShowFeelingSelector(false);
                            }}
                          >
                            {option.emoji} {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" className="add-action" onClick={() => setComposer({ ...composer, location: composer.location ? '' : ' ' })}>📍 Location</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn full"
                onClick={submitPost}
                disabled={submitting || !composer.title.trim() || !composer.content.trim()}
              >
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="modal-overlay cancel-confirm-overlay">
          <div className="cancel-confirm-modal">
            <div className="cancel-confirm-header">
              <h3>Save your progress?</h3>
              <p>You have unsaved changes. What would you like to do?</p>
            </div>
            <div className="cancel-confirm-actions">
              <button 
                onClick={handleSaveDraft}
                className="btn-save-draft"
              >
                <span className="btn-icon">💾</span>
                Save as Draft
              </button>
              <button 
                onClick={handleDiscardPost}
                className="btn-discard"
              >
                <span className="btn-icon">🗑️</span>
                Discard
              </button>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="btn-continue"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
