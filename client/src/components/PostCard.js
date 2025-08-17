import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiMessageCircle, FiBookmark, FiShare2, FiRepeat, FiMoreHorizontal, FiSend, FiEdit, FiTrash2 } from 'react-icons/fi';
import FollowButton from './FollowButton';
import ShareButtons from './ShareButtons';
import './PostCard.css';

const Comment = ({ comment, onLike, onReply, user }) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplying(false);
      setReplyText('');
    }
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <div className="comment-author-avatar">
          {comment.author?.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt={comment.author.name} />
          ) : (
            comment.author?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="comment-details">
          <div className="comment-author">{comment.author?.name || 'User'}</div>
          <div className="comment-content">{comment.content}</div>
        </div>
      </div>
      <div className="comment-actions">
        <button
          className={`comment-like-btn ${comment.likedBy?.includes(user?.id) ? 'liked' : ''}`}
          onClick={() => onLike(comment._id)}
        >
          <FiHeart /> {comment.likesCount || 0}
        </button>
        <button className="comment-reply-btn" onClick={() => setReplying(!replying)}>
          Reply
        </button>
      </div>
      {replying && (
        <div className="reply-input">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="reply-input-field"
            onKeyPress={(e) => e.key === 'Enter' && handleReply()}
          />
          <button onClick={handleReply} className="reply-post-btn"><FiSend /></button>
          <button onClick={() => setReplying(false)} className="reply-cancel-btn">Cancel</button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <Comment key={reply._id} comment={reply} onLike={onLike} onReply={onReply} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post, onLike, onBookmark, onReShare, theme = 'light' }) => {
  const { user } = useContext(AuthContext);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReShareModal, setShowReShareModal] = useState(false);
  const [reShareComment, setReShareComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showLikesList, setShowLikesList] = useState(false);
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && onLike) {
        onLike(post._id, data.data);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && onBookmark) {
        onBookmark(post._id, data.data);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleReShare = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/reshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reShareComment })
      });
      const data = await response.json();
      if (data.success) {
        setShowReShareModal(false);
        setReShareComment('');
        if (onReShare) onReShare(data.data);
      }
    } catch (error) {
      console.error('Error re-sharing post:', error);
    }
  };

  const isLiked = post.likedBy?.includes(user?.id);
  const isBookmarked = post.bookmarkedBy?.includes(user?.id);
  const isAuthor = user?.id === post.author._id;

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });
      const data = await response.json();
      if (data.success) {
        setComments([...comments, data.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await fetch(`/api/posts/${post._id}/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setComments(comments.map(comment => 
          comment._id === commentId ? data.data : comment
        ));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: replyText, parentComment: commentId })
      });
      const data = await response.json();
      if (data.success) {
        const addReplyToComment = (comments, parentId, newReply) => {
          return comments.map(comment => {
            if (comment._id === parentId) {
              return { ...comment, replies: [...(comment.replies || []), newReply] };
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: addReplyToComment(comment.replies, parentId, newReply) };
            }
            return comment;
          });
        };
        setComments(prevComments => addReplyToComment(prevComments, commentId, data.data));
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const fetchLikedByUsers = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/likes`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setLikedByUsers(data.data || []);
        setShowLikesList(true);
      }
    } catch (error) {
      console.error('Error fetching liked by users:', error);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        setShowEditMenu(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  return (
    <div className={`post-card ${theme}`}>

      {/* Re-share indicator */}
      {post.isReShare && (
        <div className="reshare-indicator">
          <FiRepeat />
          <span>Re-shared by {post.author?.name || 'Unknown User'}</span>
          {post.reShareComment && (
            <p className="reshare-comment">"{post.reShareComment}"</p>
          )}
        </div>
      )}

      {/* Post header */}
      <div className="post-header">
        <div className="author-info">
          <Link to={`/users/${post.author._id}`} className="author-avatar">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.name} />
            ) : (
              <div className="avatar-placeholder">
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>
          <div className="author-details">
            <Link to={`/users/${post.author._id}`} className="author-name">
              {post.author?.name || 'Unknown User'}
              {post.author?.role === 'admin' && <span className="admin-badge">Admin</span>}
            </Link>
            {(post.feeling || post.location) && (
              <div className="post-fl-meta">
                {post.feeling && <span>— is feeling {post.feeling}</span>}
                {post.location && <span className="post-location"> at {post.location}</span>}
              </div>
            )}
            <div className="post-meta">
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.categories?.length > 0 && (
                <div className="post-categories">
                  {post.categories.slice(0, 2).map(cat => (
                    <span key={cat} className="category-tag">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="post-actions-header">
          {user?.role !== 'admin' && post.author?.role !== 'admin' && (
            <FollowButton 
              userId={post.author._id} 
              currentUserId={user?.id}
            />
          )}
          {isAuthor && (
            <div className="post-menu">
              <button className="more-btn" onClick={() => setShowEditMenu(!showEditMenu)}>
                <FiMoreHorizontal />
              </button>
              {showEditMenu && (
                <div className="edit-menu">
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post content */}
      <div className="post-content">
        {post.attachments && post.attachments.length > 0 && (() => {
          const attachment = post.attachments[0];
          if (!attachment) return null;

          // Build media URL: prefer explicit url, else derive from path
          let mediaUrl = attachment?.url || null;
          if (!mediaUrl && attachment?.path) {
            const mediaName = attachment.path.split(/\\|\//).pop();
            mediaUrl = mediaName ? `/uploads/${mediaName}` : null;
          }
          // If in CRA dev on port 3000 and URL is relative to /uploads, prefix backend origin
          if (mediaUrl && mediaUrl.startsWith('/uploads')) {
            const isDevClient = typeof window !== 'undefined' && window.location && window.location.port === '3000';
            if (isDevClient) {
              mediaUrl = `http://localhost:5000${mediaUrl}`;
            }
          }
          if (!mediaUrl) return null;

          // Determine media type
          const isImage = attachment?.fileType === 'image' 
            || (attachment?.mimeType ? attachment.mimeType.startsWith('image') : false)
            || (/\.(png|jpe?g|gif|webp|bmp)$/i).test(mediaUrl);

          return (
            <div className="post-media">
              {isImage ? (
                <img src={mediaUrl} alt={post.title || 'attachment'} />
              ) : (
                <video controls>
                  <source src={mediaUrl} type={attachment?.mimeType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          );
        })()}
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-title-input"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-content-textarea"
            />
            <div className="edit-actions">
              <button onClick={handleEdit} className="save-btn">Save</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <Link to={`/posts/${post._id}`} className="post-title-link">
              <h3 className="post-title">{post.title}</h3>
            </Link>
            
            {post.richContent ? (
              <div 
                className="post-excerpt rich-content"
                dangerouslySetInnerHTML={{ 
                  __html: post.richContent.substring(0, 300) + '...' 
                }}
              />
            ) : (
              <p className="post-excerpt">
                {post.content.substring(0, 200)}...
              </p>
            )}
          </>
        )}

        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post footer with interactions */}
      <div className="post-footer">
        <div className="post-stats">
          <button 
            className={`stat-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <FiHeart />
            <span onClick={post.likesCount > 0 ? fetchLikedByUsers : undefined} 
                  className={post.likesCount > 0 ? 'clickable' : ''}>
              {post.likesCount || 0}
            </span>
          </button>
          
          <button className="stat-btn comment-btn" onClick={toggleComments}>
            <FiMessageCircle />
            <span>{post.commentsCount || 0}</span>
          </button>
          
          <button 
            className={`stat-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
          >
            <FiBookmark />
            <span>{post.bookmarksCount || 0}</span>
          </button>
        </div>

        <div className="post-actions">
          {!post.isReShare && (
            <button 
              className="action-btn reshare-btn"
              onClick={() => setShowReShareModal(true)}
            >
              <FiRepeat />
            </button>
          )}
        </div>
      </div>

      {/* Share menu */}
      {showShareMenu && (
        <div className="share-menu">
          <ShareButtons 
            post={post}
            onBookmark={handleBookmark}
            onReShare={() => setShowReShareModal(true)}
            isBookmarked={isBookmarked}
            showReShare={!post.isReShare}
          />
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="comments-section">
          <div className="comment-input">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input-field"
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <button onClick={handleCommentSubmit} className="comment-post-btn">
              <FiSend />
            </button>
          </div>
          <div className="comments-list">
            {comments.map(comment => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                onLike={handleCommentLike} 
                onReply={handleReplySubmit} 
                user={user} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Likes list modal */}
      {showLikesList && (
        <div className="modal-overlay" onClick={() => setShowLikesList(false)}>
          <div className="likes-modal" onClick={e => e.stopPropagation()}>
            <h3>Liked by</h3>
            <div className="likes-list">
              {likedByUsers.map(user => (
                <div key={user._id} className="like-user">
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="user-name">{user.name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLikesList(false)} className="btn-close">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Re-share modal */}
      {showReShareModal && (
        <div className="modal-overlay" onClick={() => setShowReShareModal(false)}>
          <div className="reshare-modal" onClick={e => e.stopPropagation()}>
            <h3>Re-share this post</h3>
            <div className="original-post-preview">
              <h4>{post.title}</h4>
              <p>by {post.author?.name || 'Unknown User'}</p>
            </div>
            <textarea
              value={reShareComment}
              onChange={(e) => setReShareComment(e.target.value)}
              placeholder="Add your thoughts (optional)..."
              className="reshare-textarea"
            />
            <div className="modal-actions">
              <button onClick={() => setShowReShareModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleReShare} className="btn-reshare">
                Re-share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
