import React from 'react';

const PostCard = ({ title, authorName, date, excerpt, to }) => {
  return (
    <a href={to} className="post card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <h3 className="post__title">{title}</h3>
      <p className="post__meta">By {authorName} · {new Date(date).toLocaleDateString()}</p>
      <p className="post__excerpt">{excerpt}</p>
    </a>
  );
};

export default PostCard;


