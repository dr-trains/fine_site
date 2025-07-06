import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Home.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (currentUserId) => {
    try {
      const response = await api.get('/api/posts/global-feed');
      const postsWithLikeStatus = response.data.map(post => ({
        ...post,
        isLiked: post.likes.includes(currentUserId)
      }));
      setPosts(postsWithLikeStatus);
    } catch (error) {
      console.error('Error fetching global posts:', error.response?.data || error.message);
    }
  };

  return (
    <div className="posts-feed">
      {posts.map(post => (
        <div key={post._id} className="post">
          <div className="post-header">
            <div className="user-info" onClick={() => navigate(`/profile/${post.user?._id}`)}>
              <div className="avatar">
                {post.user?.profilePicture ? (
                  <img src={post.user.profilePicture} alt="" />
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
          
          {post.media && post.mediaType === 'video' && (
            <div className="media-container">
              <video 
                controls
                playsInline
                preload="metadata"
                poster={post.thumbnail || ''}
                className="video-player"
              >
                <source src={post.media} type={post.media.endsWith('.mp4') ? 'video/mp4' : 'video/webm'} />
                Your browser does not support video playback.
              </video>
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="empty-feed">
          <div className="empty-feed-icon">
            <i className="fas fa-camera"></i>
          </div>
          <h2>No Videos Yet</h2>
          <p>Be the first to post a video!</p>
        </div>
      )}
    </div>
  );
};

export default Explore; 