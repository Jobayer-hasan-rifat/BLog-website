import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/posts';
import '../styles/BlogList.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <div className="list">
      <h2>Recent posts</h2>
      <div className="list__grid">
        {posts.map((post) => (
          <Link to={`/posts/${post._id}`} key={post._id} className="post card">
            <h3 className="post__title">{post.title}</h3>
            <p className="post__meta">By {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}</p>
            <p className="post__excerpt">{post.content?.slice(0, 120)}{post.content?.length > 120 ? '…' : ''}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogList;


