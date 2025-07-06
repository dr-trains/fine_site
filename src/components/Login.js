import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });

      const response = await api.post('/api/users/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Log the stored data to verify
      console.log('Stored token:', response.data.token);
      console.log('Stored user:', response.data.user);
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Invalid response from server') {
        setError('Received invalid data from server');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Try to log in as guest
      const response = await api.post('/api/users/login', {
        email: 'guest@fineshytig.com',
        password: 'guestpassword'
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('guest', 'true');
      navigate('/');
    } catch (err) {
      // If login fails with 400, try to register the guest user, then login again
      if (err.response && err.response.status === 400) {
        try {
          await api.post('/api/users/register', {
            username: 'guest',
            email: 'guest@fineshytig.com',
            password: 'guestpassword',
            name: 'Guest User'
          });
          // Try login again
          const response = await api.post('/api/users/login', {
            email: 'guest@fineshytig.com',
            password: 'guestpassword'
          });
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('guest', 'true');
          navigate('/');
        } catch (registerErr) {
          alert('Guest login failed!');
        }
      } else {
        alert('Guest login failed!');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo-text">Fine Shyt IG</h1>
        <p className="auth-subtitle">Log in to see photos and videos from your friends.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button">Log In</button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
          <button
            type="button"
            className="guest-button"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 