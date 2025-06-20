import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Search from './components/Search';
import Explore from './components/Explore';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Create from './components/Create';
import Settings from './components/Settings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/search" element={
          <PrivateRoute>
            <Search />
          </PrivateRoute>
        } />
        <Route path="/explore" element={
          <PrivateRoute>
            <Explore />
          </PrivateRoute>
        } />
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/profile/:userId" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/create" element={
          <PrivateRoute>
            <Create />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App; 