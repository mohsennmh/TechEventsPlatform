import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../assets/styles/chat.css';

const socket = io('http://localhost:5000');

const Chat = ({ eventId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
          console.log("usrname: ",response.data.user);
        } catch (err) {
          console.error('Error fetching user info:', err.message);
          setUser(null);
        }
      } else {
        setUser(null); // Set to null if no token
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${eventId}`);
        if (response.data) {
          setMessages(response.data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err.message);
        alert('There was an issue fetching messages. Please try again later.');
      }
    };

    if (eventId) {
      socket.emit('joinRoom', eventId);
      fetchMessages();
    }

    socket.on('receiveMessage', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      if (eventId) {
        socket.emit('leaveRoom', eventId);
      }
    };
  }, [eventId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      alert('Message cannot be empty.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to send a message.');
      return;
    }

    const messageData = {
      eventId,
      user: user?.name || 'Guest', // Ensure fallback to Guest only if user is null
      text: trimmedMessage,
      time: new Date().toLocaleTimeString(),
    };

    try {
      const response = await axios.post(
        `http://localhost:5000/api/chats/${eventId}`,
        messageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setMessages((prevMessages) => [...prevMessages, response.data]);
        setMessage('');
      } else {
        alert('Error sending message.');
      }
    } catch (err) {
      console.error('Error sending message:', err.message);
      alert('Error sending message.');
    }
  };

  return (
    <div className="chat-container">
      <h3>Event Chat</h3>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}</strong> <span>{msg.time}</span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
