import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Explore.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalVideos();
  }, []);

  const fetchGlobalVideos = async () => {
    try {
      const response = await api.get('/api/posts/videos');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching global videos:', error);
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
        {posts.filter(post => post.mediaType === 'video').map(post => (
          <div 
            key={post._id} 
            className="explore-item"
            onClick={() => handlePostClick(post._id)}
          >
            <div className="grid-item-content">
              <video>
                <source src={post.media} type="video/mp4" />
              </video>
              <div className="video-icon">
                <i className="fas fa-play"></i>
              </div>
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