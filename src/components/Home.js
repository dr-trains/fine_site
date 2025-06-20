import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/posts/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error.response?.data || error.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="posts-feed">
      {posts.map(post => (
        <div key={post._id} className="post">
          <div className="post-header">
            <div className="user-info" onClick={() => navigate(`/profile/${post.user?._id}`)}>
              <div className="avatar">
                {post.user?.profilePicture ? (
                  <img src={`http://localhost:5000${post.user.profilePicture}`} alt="" />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <span className="username">{post.user?.username}</span>
            </div>
            <div className="post-header-right">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          {post.caption && <p className="caption">{post.caption}</p>}
          
          {post.media && (
            <div className="media-container">
              {post.mediaType === 'video' ? (
                <video 
                  controls
                  playsInline
                  preload="metadata"
                  poster={post.thumbnail || ''}
                  className="video-player"
                >
                  <source src={`http://localhost:5000${post.media}`} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <img 
                  src={`http://localhost:5000${post.media}`} 
                  alt={post.caption || ''} 
                  loading="lazy" 
                />
              )}
            </div>
          )}

          <div className="post-actions">
            <button 
              className={`action-btn ${post.likes?.includes(user._id) ? 'liked' : ''}`}
              onClick={() => handleLike(post._id)}
            >
              <i className="fas fa-heart"></i>
              <span className="action-count">{post.likes?.length || 0}</span>
            </button>
            <button className="action-btn">
              <i className="fas fa-comment"></i>
              <span className="action-count">{post.comments?.length || 0}</span>
            </button>
            <button className="action-btn">
              <i className="fas fa-share"></i>
            </button>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div className="empty-feed">
          <div className="empty-feed-icon">
            <i className="fas fa-camera"></i>
          </div>
          <h2>No Posts Yet</h2>
          <p>Start following users to see their posts!</p>
        </div>
      )}
    </div>
  );
};

export default Home; 