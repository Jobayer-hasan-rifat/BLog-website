import React, { useEffect, useState, useCallback } from 'react';
import PostCard from '../components/PostCard';
import PostFilters from '../components/PostFilters';
import InfiniteScroll from 'react-infinite-scroll-component';
import './BlogList.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'latest',
    category: '',
    author: '',
    status: 'published'
  });

  const fetchPosts = useCallback(async (pageNum = 1, currentFilters = filters, reset = false) => {
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        limit: 10,
        ...currentFilters
      });

      const response = await fetch(`/api/posts?${queryParams}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        if (reset || pageNum === 1) {
          setPosts(data.data.posts);
        } else {
          setPosts(prev => [...prev, ...data.data.posts]);
        }
        setHasMore(data.data.posts.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts(1, filters, true);
  }, [filters, fetchPosts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setLoading(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, filters);
    }
  };

  const handlePostUpdate = (postId, updatedData) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId ? { ...post, ...updatedData } : post
      )
    );
  };

  const handleReShare = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="blog-list-container">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      <div className="main-content">
        <div className="blog-list-header">
          <h1>Discover Posts</h1>
          <p>Explore the latest posts from our community</p>
        </div>

        <PostFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={loadMore}
              hasMore={hasMore}
              loader={<div className="loading-more">Loading more posts...</div>}
              endMessage={
                <div className="end-message">
                  <p>You've seen all posts!</p>
                </div>
              }
            >
              <div className="posts-grid">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onLike={handlePostUpdate}
                    onBookmark={handlePostUpdate}
                    onReShare={handleReShare}
                  />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>

    </div>
  );
};

export default BlogList;


