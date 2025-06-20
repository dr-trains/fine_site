import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))._id;
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData(prevState => ({
        ...prevState,
        name: response.data.name || '',
        username: response.data.username || '',
        email: response.data.email || '',
        bio: response.data.bio || ''
      }));
      setLoading(false);
    } catch (err) {
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))._id;

      // If changing password, verify passwords match
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError('New passwords do not match');
          return;
        }
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          return;
        }
      }

      const updateData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await axios.put(`http://localhost:5000/api/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local storage with new user data
      const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1>Edit Profile</h1>

        <form onSubmit={handleSubmit} className="settings-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              rows="4"
            />
          </div>

          <div className="form-divider"></div>

          <h2>Change Password</h2>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Current Password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/profile')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 