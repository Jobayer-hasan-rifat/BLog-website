import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiUserMinus } from 'react-icons/fi';
import './FollowButton.css';

const FollowButton = ({ userId, currentUserId, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      checkFollowStatus();
    }
  }, [userId, currentUserId]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/follow/${userId}/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(data.data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/follow/${userId}`, {
        method,
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(!isFollowing);
        if (onFollowChange) {
          onFollowChange(!isFollowing);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (!userId || !currentUserId || userId === currentUserId) {
    return null;
  }

  return (
    <button
      className={`follow-button ${isFollowing ? 'following' : 'not-following'} ${loading ? 'loading' : ''}`}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <span className="loading-spinner"></span>
      ) : isFollowing ? (
        <>
          <FiUserMinus />
          Unfollow
        </>
      ) : (
        <>
          <FiUserPlus />
          Follow
        </>
      )}
    </button>
  );
};

export default FollowButton;
