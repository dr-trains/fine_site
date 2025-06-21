import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
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
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPosts(parsedUser._id);
  }, [navigate]);

  const fetchPosts = async (currentUserId) => {
    try {
      const response = await api.get('/api/posts/feed');
      const postsWithLikeStatus = response.data.map(post => ({
        ...post,
        isLiked: post.likes.includes(currentUserId)
      }));
      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('Error fetching posts:', error.response?.data || error.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/api/posts/${postId}/like`);
      setPosts(posts.map(p => {
        if (p._id === postId) {
          return { ...p, isLiked: !p.isLiked };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      fetchPosts(user._id);
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
                  <img src={`${api.defaults.baseURL}${post.user.profilePicture}`} alt="" />
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
                  <source src={`${api.defaults.baseURL}${post.media}`} type={post.media.endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <img 
                  src={`${api.defaults.baseURL}${post.media}`} 
                  alt={post.caption || ''} 
                  loading="lazy" 
                />
              )}
            </div>
          )}

          <div className="post-actions">
            <button 
              className={`action-btn ${post.isLiked ? 'liked' : ''}`}
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