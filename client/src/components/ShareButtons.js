import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon
} from 'react-share';
import { FiShare2, FiBookmark, FiRepeat } from 'react-icons/fi';
import './ShareButtons.css';

const ShareButtons = ({ 
  post, 
  onBookmark, 
  onReShare, 
  isBookmarked = false,
  showReShare = true 
}) => {
  const shareUrl = `${window.location.origin}/posts/${post._id}`;
  const title = post.title;

  const handleExternalShare = () => {
    // Increment share count
    fetch(`/api/posts/${post._id}/share`, { method: 'POST' })
      .catch(err => console.error('Error updating share count:', err));
  };

  return (
    <div className="share-buttons">
      <div className="share-section">
        <h4 className="share-title">
          <FiShare2 /> Share this post
        </h4>
        
        <div className="social-buttons">
          <FacebookShareButton
            url={shareUrl}
            quote={title}
            onClick={handleExternalShare}
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <TwitterShareButton
            url={shareUrl}
            title={title}
            onClick={handleExternalShare}
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <LinkedinShareButton
            url={shareUrl}
            title={title}
            onClick={handleExternalShare}
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>

          <WhatsappShareButton
            url={shareUrl}
            title={title}
            onClick={handleExternalShare}
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={onBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <FiBookmark />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>

        {showReShare && (
          <button
            className="action-btn reshare-btn"
            onClick={onReShare}
            title="Re-share this post"
          >
            <FiRepeat />
            Re-share
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareButtons;
