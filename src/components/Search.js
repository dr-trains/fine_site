import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Search.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [], hashtags: [] });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/users/search?q=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // Wait 300ms after the user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Prevent form submission
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search users, posts, or hashtags..."
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : (
          <>
            {/* Users Section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="results-section">
                <h2>Users</h2>
                {searchResults.users.map(user => (
                  <div key={user._id} className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
                    <div className="user-avatar">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      {user.bio && <span className="bio">{user.bio}</span>}
                      <span className="followers">{user.followers?.length || 0} followers</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts Section */}
            {searchResults.posts && searchResults.posts.length > 0 && (
              <div className="results-section">
                <h2>Posts</h2>
                {searchResults.posts.map(post => (
                  <div key={post._id} className="post-card" onClick={() => navigate(`/post/${post._id}`)}>
                    <div className="post-preview">
                      {post.mediaType === 'image' && (
                        <img src={post.media} alt="Post preview" className="post-media" />
                      )}
                    </div>
                    <div className="post-info">
                      <span className="post-caption">{post.caption}</span>
                      <span className="post-user">by @{post.user.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags Section */}
            {searchResults.hashtags && searchResults.hashtags.length > 0 && (
              <div className="results-section">
                <h2>Hashtags</h2>
                {searchResults.tagStats?.map(tag => (
                  <div key={tag._id} className="hashtag-card" onClick={() => navigate(`/tag/${tag._id}`)}>
                    <span className="hashtag">#{tag._id}</span>
                    <span className="post-count">{tag.count} posts</span>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {searchQuery && !loading && 
             (!searchResults.users?.length && 
              !searchResults.posts?.length && 
              !searchResults.hashtags?.length) && (
              <div className="no-results">No results found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search; 