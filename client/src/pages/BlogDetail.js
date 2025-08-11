import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPost } from '../services/posts';
import '../styles/BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPost(id);
        setPost(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return null;
  if (!post) return <div className="card">Post not found</div>;

  return (
    <article className="detail card">
      <h1 className="detail__title">{post.title}</h1>
      <p className="detail__meta">By {post.author?.name} · {new Date(post.createdAt).toLocaleString()}</p>
      <div className="detail__content">{post.content}</div>
    </article>
  );
};

export default BlogDetail;


