import React from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import './PostFilters.css';

const PostFilters = ({ 
  sortBy, 
  setSortBy, 
  category, 
  setCategory, 
  searchTerm, 
  setSearchTerm,
  categories = []
}) => {
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'mostLiked', label: 'Most Liked' },
    { value: 'mostCommented', label: 'Most Commented' }
  ];

  return (
    <div className="post-filters">
      <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PostFilters;
