import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const { userId } = useParams();
  const navigate = useNavigate();

  const getCurrentUser = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('Raw user data from localStorage:', userData);
      console.log('Current token:', token ? 'exists' : 'missing');

      if (!userData || !token) {
        console.log('No user data or token found');
        return null;
      }

      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);

      if (!parsedUser.id && !parsedUser._id) {
        console.log('No user ID found in parsed data');
        return null;
      }

      // Ensure we have _id property
      if (!parsedUser._id) {
        parsedUser._id = parsedUser.id;
      }

      return parsedUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        console.log('No authentication data found');
        navigate('/login');
        return;
      }

      const targetUserId = userId || currentUser._id;
      console.log('Target user ID for profile:', targetUserId);
      console.log('Current user:', currentUser);

      if (!targetUserId) {
        console.error('No target user ID available');
        setError('Unable to determine which profile to load');
        return;
      }

      const response = await api.get(`/api/users/${targetUserId}`);

      console.log('Profile response:', response.data);
      setProfile(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, navigate, getCurrentUser]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        return;
      }

      const targetUserId = userId || currentUser._id;
      console.log('Fetching posts for user:', targetUserId);

      const response = await api.get(`/api/users/${targetUserId}/posts`);

      console.log('Posts response:', response.data);
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  }, [userId, getCurrentUser]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('No user data found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Initializing profile with user:', currentUser);
    fetchProfile();
    fetchUserPosts();
  }, [fetchProfile, fetchUserPosts, getCurrentUser, navigate]);

  const handleFollowAction = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !profile) return;

      const isFollowing = profile.followers?.includes(currentUser._id);
      const endpoint = isFollowing ? 'unfollow' : 'follow';

      await api.post(`/api/users/${endpoint}/${profile._id}`);
      
      // Refresh profile to get updated followers list
      await fetchProfile();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div className="error-message">Profile not found</div>;
  }

  const isOwnProfile = !userId || (profile && profile._id === getCurrentUser()?._id);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.username} />
          ) : (
            <div className="default-avatar">
              <i className="fas fa-user"></i>
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-actions">
            <h1>{profile.username}</h1>
            {isOwnProfile ? (
              <button className="edit-profile-btn" onClick={() => navigate('/settings')}>
                Edit Profile
              </button>
            ) : (
              <button 
                className={`follow-btn ${profile.followers?.includes(getCurrentUser()?._id) ? 'following' : ''}`}
                onClick={handleFollowAction}
              >
                {profile.followers?.includes(getCurrentUser()?._id) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.followers?.length || 0}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile.following?.length || 0}</span>
              <span className="stat-label">following</span>
            </div>
          </div>

          <div className="profile-bio">
            <span className="profile-name">{profile.name}</span>
            <p>{profile.bio}</p>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <i className="fas fa-th"></i>
            <span>Posts</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <i className="fas fa-bookmark"></i>
            <span>Saved</span>
          </button>
        </div>

        <div className="posts-grid">
          {posts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">
                <i className="fas fa-camera"></i>
              </div>
              <h2>No Posts Yet</h2>
              {isOwnProfile && (
                <p>Share your first photo or video</p>
              )}
            </div>
          ) : (
            posts.map(post => (
              <div 
                key={post._id} 
                className="grid-item"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {post.mediaType === 'video' ? (
                  <div className="media-container video">
                    <video>
                      <source src={`${api.defaults.baseURL}${post.media}`} type="video/mp4" />
                    </video>
                    <i className="fas fa-play"></i>
                  </div>
                ) : (
                  <div className="media-container">
                    <img 
                      src={`${api.defaults.baseURL}${post.media}`}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 