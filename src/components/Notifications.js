import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    markAsRead(notification._id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        navigate(`/post/${notification.post}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.sender._id}`);
        break;
      default:
        break;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with you';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return 'fa-heart';
      case 'comment':
        return 'fa-comment';
      case 'follow':
        return 'fa-user-plus';
      default:
        return 'fa-bell';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <i className="fas fa-bell"></i>
            <h3>No Notifications Yet</h3>
            <p>When you get notifications, they'll show up here</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-avatar">
                {notification.sender.profilePicture ? (
                  <img src={notification.sender.profilePicture} alt={notification.sender.username} />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <div className="notification-content">
                <span className="notification-username">{notification.sender.username}</span>
                <span className="notification-text">{getNotificationText(notification)}</span>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="notification-icon">
                <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications; 