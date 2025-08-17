import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUsers, FiFileText, FiMessageSquare, FiUserX, FiStar, FiTrendingUp, FiTrash2, FiShield } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Posts management state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState('published'); // 'published' | 'draft'

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postStatusFilter]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (postStatusFilter) params.append('status', postStatusFilter);
      params.append('limit', 50);
      const res = await fetch(`/api/posts?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? data.data : u));
      }
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeletePost = async (postId, reason) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
      } else {
        setError(data.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleBanPostAuthor = async (authorId) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    await handleBanUser(authorId, reason);
    // reflect ban in posts list by marking author as banned if present there
    setPosts(prev => prev.map(p => (
      p.author && p.author._id === authorId ? { ...p, author: { ...p.author, isBanned: true } } : p
    )));
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'banned' && u.isBanned) ||
                         (statusFilter === 'active' && !u.isBanned);
    return matchesSearch && matchesStatus;
  });

  const filteredPosts = posts.filter(p => {
    const text = `${p.title} ${p.content || ''} ${p.author?.name || ''}`.toLowerCase();
    return text.includes(postSearch.toLowerCase());
  });

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user?.name}. Manage your MiniBlog platform.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon posts">
            <FiFileText />
          </div>
          <div className="stat-info">
            <h3>{stats.stats?.totalPosts || 0}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon comments">
            <FiMessageSquare />
          </div>
          <div className="stat-info">
            <h3>{stats.stats?.totalComments || 0}</h3>
            <p>Total Comments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon banned">
            <FiUserX />
          </div>
          <div className="stat-info">
            <h3>{stats.stats?.bannedUsers || 0}</h3>
            <p>Banned Users</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="admin-section">
        <div className="section-header">
          <h3>User Management</h3>
          <div className="user-filters">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        <div className="users-table">
          {filteredUsers.map(u => (
            <div key={u._id} className={`user-row ${u.isBanned ? 'banned' : ''}`}>
              <div className="user-info">
                <div className="user-avatar">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {u.name} {u.username && `(@${u.username})`}
                    {u.role === 'admin' && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="user-email">{u.email}</div>
                  <div className="user-stats">
                    Posts: {u.postsCount || 0} | Comments: {u.commentsCount || 0} | 
                    Followers: {u.followersCount || 0}
                  </div>
                  {u.isBanned && (
                    <div className="ban-info">
                      Banned: {u.banReason} ({new Date(u.banDate).toLocaleDateString()})
                    </div>
                  )}
                </div>
              </div>
              <div className="user-actions">
                {u.role !== 'admin' && (
                  <button
                    onClick={() => {
                      if (u.isBanned) {
                        handleBanUser(u._id, '');
                      } else {
                        const reason = prompt('Ban reason:');
                        if (reason) handleBanUser(u._id, reason);
                      }
                    }}
                    className={`action-btn ${u.isBanned ? 'unban-btn' : 'ban-btn'}`}
                  >
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Posts */}
      <div className="admin-section">
        <div className="section-header">
          <h3>Manage Posts</h3>
          <div className="user-filters">
            <input
              type="text"
              placeholder="Search posts..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={postStatusFilter}
              onChange={(e) => setPostStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {postsLoading ? (
          <div className="admin-loading">Loading posts...</div>
        ) : (
          <div className="users-table">
            {filteredPosts.map(p => (
              <div key={p._id} className="user-row">
                <div className="user-info">
                  <div className="user-details">
                    <div className="user-name">
                      {p.title}
                      {p.isFeatured && <span className="admin-badge">Featured</span>}
                    </div>
                    <div className="user-email">
                      Author: {p.author?.name || 'Unknown'} • {new Date(p.createdAt).toLocaleString()} • Status: {p.status}
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  {p.author && p.author.role !== 'admin' && (
                    <button
                      title="Ban author"
                      onClick={() => handleBanPostAuthor(p.author._id)}
                      className="action-btn ban-btn"
                    >
                      <FiShield style={{ marginRight: 6 }} /> Ban Author
                    </button>
                  )}
                  <button
                    title="Delete post"
                    onClick={() => {
                      const reason = prompt('Reason for deleting this post (optional):');
                      handleDeletePost(p._id, reason || '');
                    }}
                    className="action-btn danger-btn"
                  >
                    <FiTrash2 style={{ marginRight: 6 }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/admin/posts" className="action-card">
            <FiFileText />
            <span>Manage Posts</span>
          </Link>
          <Link to="/admin/comments" className="action-card">
            <FiMessageSquare />
            <span>Moderate Comments</span>
          </Link>
          <Link to="/admin/featured" className="action-card">
            <FiStar />
            <span>Featured Posts</span>
          </Link>
          <Link to="/admin/analytics" className="action-card">
            <FiTrendingUp />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
