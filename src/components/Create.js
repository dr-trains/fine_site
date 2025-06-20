import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Create.css';

const Create = () => {
  const [post, setPost] = useState({ caption: '', media: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost({ ...post, media: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!post.media) {
      setError('Please select a photo or video');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('caption', post.caption);
      formData.append('media', post.media);

      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <div className="create-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Create new post</h1>
          <button 
            className="share-btn" 
            onClick={handleSubmit}
            disabled={loading || !post.media}
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>

        <div className="create-content">
          {!preview ? (
            <div className="upload-area">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Drag photos and videos here</p>
              <label className="select-btn">
                Select from computer
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <div className="media-side">
                {post.media?.type.startsWith('video/') ? (
                  <video 
                    src={preview} 
                    controls 
                    className="media-preview"
                  />
                ) : (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="media-preview"
                  />
                )}
              </div>
              <div className="caption-side">
                <div className="caption-header">
                  <div className="user-info">
                    <div className="user-avatar"></div>
                    <span className="username">
                      {JSON.parse(localStorage.getItem('user'))?.username}
                    </span>
                  </div>
                </div>
                <div className="caption-input-container">
                  <textarea
                    placeholder="Write a caption..."
                    value={post.caption}
                    onChange={(e) => setPost({ ...post, caption: e.target.value })}
                    className="caption-input"
                    maxLength={2200}
                  />
                  <div className="caption-footer">
                    <span className="char-count">
                      {post.caption.length}/2,200
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Create; 