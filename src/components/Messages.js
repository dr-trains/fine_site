import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/api/conversations');
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/messages/${conversationId}`);
      setMessages(response.data);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post('/api/messages', {
        recipient: selectedConversation,
        content: newMessage
      });

      setNewMessage('');
      fetchMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation._id);
    fetchMessages(conversation._id);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="messages-container">
      <div className="conversations-list">
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>
        {conversations.map(conversation => (
          <div
            key={conversation._id}
            className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
            onClick={() => selectConversation(conversation)}
          >
            <div className="conversation-avatar">
              {conversation.participants[0].profilePicture ? (
                <img src={conversation.participants[0].profilePicture} alt={conversation.participants[0].username} />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="conversation-info">
              <span className="conversation-name">{conversation.participants[0].username}</span>
              <span className="last-message">{conversation.lastMessage?.content || 'No messages yet'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="messages-content">
        {selectedConversation ? (
          <>
            <div className="messages-header">
              <h3>{selectedConversation.participants[0].username}</h3>
            </div>
            <div className="messages-list">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`message ${message.sender === localStorage.getItem('userId') ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <i className="fas fa-paper-plane"></i>
            <h3>Your Messages</h3>
            <p>Send private messages to a friend</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 