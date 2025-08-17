import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiSend } from 'react-icons/fi';
import { DraftsContext } from '../context/DraftsContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/Drafts.css';

const Drafts = () => {
  const { drafts, removeDraft } = useContext(DraftsContext);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handlePublish = async (draft) => {
    setSelectedDraft(draft);
    setShowPublishModal(true);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmPublish = async () => {
    if (!selectedDraft) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: selectedDraft.title,
          content: selectedDraft.content,
          feeling: selectedDraft.feeling,
          location: selectedDraft.location,
          status: 'published'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        removeDraft(selectedDraft.id);
        setShowPublishModal(false);
        setSelectedDraft(null);
        showNotification('Draft published successfully!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Failed to publish draft');
        showNotification('Failed to publish draft', 'error');
      }
    } catch (err) {
      setError('Error publishing draft');
      showNotification('Error publishing draft', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (draft) => {
    setSelectedDraft(draft);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedDraft) {
      removeDraft(selectedDraft.id);
      setShowDeleteModal(false);
      setSelectedDraft(null);
      showNotification('Draft deleted successfully!');
    }
  };

  const handleEdit = (draft) => {
    // Navigate to home with draft data in state
    navigate('/?create=true', { state: { draft } });
  };


  return (
    <div className="drafts-container">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="drafts-header">
        <h2>My Drafts</h2>
        <Link to="/?create=true" className="btn-primary">
          Create New Post
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {drafts.length === 0 ? (
        <div className="empty-state">
          <h3>No drafts yet</h3>
          <p>Start writing your first blog post!</p>
          <Link to="/?create=true" className="btn-primary">
            Create Post
          </Link>
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map(draft => (
            <div key={draft.id} className="draft-card">
              <div className="draft-content">
                <h3 className="draft-title">{draft.title || 'Untitled Draft'}</h3>
                <p className="draft-excerpt">
                  {draft.content ? draft.content.substring(0, 150) + '...' : 'No content yet'}
                </p>
                <div className="draft-meta">
                  <span className="draft-date">
                    Created: {new Date(draft.createdAt).toLocaleDateString()}
                  </span>
                  {draft.feeling && (
                    <div className="draft-feeling">
                      <span className="feeling-tag">{draft.feeling}</span>
                    </div>
                  )}
                  {draft.location && (
                    <div className="draft-location">
                      <span className="location-tag">📍 {draft.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="draft-actions">
                <button
                  onClick={() => handleEdit(draft)}
                  className="action-btn edit-btn"
                  title="Edit"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handlePublish(draft)}
                  className="action-btn publish-btn"
                  title="Publish"
                >
                  <FiSend />
                </button>
                <button
                  onClick={() => handleDelete(draft)}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="modal-overlay">
          <div className="publish-modal">
            <div className="modal-header">
              <h3>Publish Draft</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowPublishModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to publish this draft?</p>
              <div className="draft-preview">
                <h4>{selectedDraft?.title || 'Untitled'}</h4>
                <p>{selectedDraft?.content?.substring(0, 100)}...</p>
                {selectedDraft?.feeling && (
                  <div className="preview-feeling">{selectedDraft.feeling}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPublish}
                disabled={submitting}
                className="btn-publish"
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header">
              <h3>Delete Draft</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this draft?</p>
              <div className="draft-preview">
                <h4>{selectedDraft?.title || 'Untitled'}</h4>
                <p>{selectedDraft?.content?.substring(0, 100)}...</p>
              </div>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drafts;
