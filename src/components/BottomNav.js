import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item${location.pathname === '/' ? ' active' : ''}`}> 
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      <Link to="/search" className={`nav-item${location.pathname === '/search' ? ' active' : ''}`}> 
        <i className="fas fa-search"></i>
        <span>Search</span>
      </Link>
      <Link to="/explore" className={`nav-item${location.pathname === '/explore' ? ' active' : ''}`}> 
        <i className="fas fa-compass"></i>
        <span>Explore</span>
      </Link>
      <Link to="/profile" className={`nav-item${location.pathname.startsWith('/profile') ? ' active' : ''}`}> 
        <i className="fas fa-user"></i>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav; 