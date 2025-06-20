import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/posts/explore', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        <h1>Explore</h1>
      </div>
      
      <div className="explore-grid">
        {posts.map(post => (
          <div 
            key={post._id} 
            className="explore-item"
            onClick={() => handlePostClick(post._id)}
          >
            {post.mediaType === 'video' ? (
              <div className="media-container video">
                <video>
                  <source src={`http://localhost:5000${post.media}`} type="video/mp4" />
                </video>
                <i className="fas fa-play"></i>
              </div>
            ) : (
              <div className="media-container">
                <img 
                  src={`http://localhost:5000${post.media}`}
                  alt={post.caption}
                />
              </div>
            )}
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