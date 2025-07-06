import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const fetchExplorePosts = async () => {
    try {
      const response = await api.get('/api/posts/explore');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching explore posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="explore-container">
      <div className="explore-header">
        <h1>Global Video Feed</h1>
      </div>
      
      <div className="explore-grid">
        {posts.map(post => (
          <div 
            key={post._id} 
            className="explore-item"
            onClick={() => handlePostClick(post._id)}
          >
            <div className="grid-item-content">
              {post.mediaType === 'video' ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', maxWidth: '100%' }}
                >
                  <source src={post.media} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <img src={post.media} alt={post.caption} style={{ width: '100%', maxWidth: '100%' }} />
              )}
            </div>
            <div className="post-overlay">
              <div className="post-stats">
                <span><i className="fas fa-heart"></i> {post.likes?.length || 0}</span>
                <span><i className="fas fa-comment"></i> {post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore; 