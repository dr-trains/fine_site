import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isGuest = localStorage.getItem('guest') === 'true';

  return (
    <div className="app-container">
      <nav className="sidebar">
        <Link to="/" className="logo">
          <h1>Fine Shyt IG</h1>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>

          <Link to="/search" className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
            <i className="fas fa-search"></i>
            <span>Search</span>
          </Link>

          <Link to="/explore" className={`nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
            <i className="fas fa-compass"></i>
            <span>Explore</span>
          </Link>

          <Link to="/messages" className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
            <i className="fas fa-paper-plane"></i>
            <span>Messages</span>
          </Link>

          <Link to="/notifications" className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <i className="fas fa-heart"></i>
            <span>Notifications</span>
          </Link>

          <Link to="/create" className={`nav-item ${location.pathname === '/create' ? 'active' : ''}`}>
            <i className="fas fa-plus-square"></i>
            <span>Create</span>
          </Link>

          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>

          {isGuest ? (
            <button onClick={() => {
              localStorage.removeItem('guest');
              navigate('/login');
            }} className="nav-item logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              <span>Exit Guest</span>
            </button>
          ) : (
            <button onClick={handleLogout} className="nav-item logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 