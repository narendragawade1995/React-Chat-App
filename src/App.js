import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
const customStyles = `
  .chat-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px 0;
  }

  .chat-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    overflow: hidden;
  }

  .user-list {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-item {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 15px;
    margin: 5px;
  }

  .user-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }

  .user-item.active {
    background: rgba(255, 255, 255, 0.2);
    border-left: 4px solid #fff;
  }

  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .message-container {
    background: #f8f9fa;
    background-image: 
      radial-gradient(circle at 25px 25px, lightgray 2px, transparent 0),
      radial-gradient(circle at 75px 75px, lightgray 2px, transparent 0);
    background-size: 100px 100px;
    background-position: 0 0, 50px 50px;
    opacity: 0.1;
  }

  .message-bubble {
    max-width: 70%;
    border-radius: 20px;
    padding: 12px 16px;
    margin: 8px 0;
    position: relative;
    animation: fadeInUp 0.3s ease;
  }

  .message-sent {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 5px;
  }

  .message-received {
    background: white;
    color: #333;
    border: 1px solid #e9ecef;
    border-bottom-left-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    color: #6c757d;
    font-style: italic;
  }

  .typing-dots {
    display: flex;
    gap: 3px;
    margin-left: 10px;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    background: #6c757d;
    border-radius: 50%;
    animation: typingBounce 1.4s infinite ease-in-out;
  }

  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typingBounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .online-indicator {
    width: 12px;
    height: 12px;
    background: #28a745;
    border-radius: 50%;
    border: 2px solid white;
  }

  .offline-indicator {
    width: 12px;
    height: 12px;
    background: #6c757d;
    border-radius: 50%;
    border: 2px solid white;
  }

  .login-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
  }

  .input-group-custom {
    position: relative;
    margin-bottom: 20px;
  }

  .input-group-custom input {
    border-radius: 15px;
    border: 2px solid #e9ecef;
    padding: 12px 20px;
    transition: all 0.3s ease;
  }

  .input-group-custom input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  .btn-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 15px;
    padding: 12px 30px;
    color: white;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    color: white;
  }

  .message-input {
    border-radius: 25px;
    border: 2px solid #e9ecef;
    padding: 12px 20px;
    transition: all 0.3s ease;
  }

  .message-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  .send-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
  }

  .send-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .avatar-img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .user-status {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 5px;
  }

  .no-messages {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    margin-top: 50px;
  }

  .app-title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 30px;
  }
`;
function App() {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    // Inject custom styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectSocket = (username) => {
    const newSocket = io('https://chatappserver-gd1u.onrender.com');
    setSocket(newSocket);

    newSocket.emit('user_login', {
      username,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`
    });

    newSocket.on('user_list', (userList) => {
      setUsers(userList);
    });

    newSocket.on('user_joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('user_left', (data) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, status: 'offline', lastSeen: data.lastSeen }
          : user
      ));
    });

    newSocket.on('private_message', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message]
      }));
    });

    newSocket.on('message_sent', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.recipientId]: [...(prev[message.recipientId] || []), message]
      }));
    });

    newSocket.on('message_history', (data) => {
      setMessages(prev => ({
        ...prev,
        [data.otherUserId]: data.messages.filter(msg => 
          msg.senderId === newSocket.id || msg.recipientId === newSocket.id
        )
      }));
    });

    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.username
      }));
    });

    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    return newSocket;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      const newSocket = connectSocket(username);
      setCurrentUser({
        username,
        id: newSocket.id,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`
      });
      setIsLoggedIn(true);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    if (socket) {
      socket.emit('get_message_history', { otherUserId: user.id });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser && socket) {
      const messageData = {
        recipientId: selectedUser.id,
        message: messageInput.trim(),
        timestamp: new Date().toISOString()
      };

      socket.emit('private_message', messageData);
      setMessageInput('');
      
      // Stop typing indicator
      socket.emit('typing_stop', { recipientId: selectedUser.id });
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (selectedUser && socket) {
      socket.emit('typing_start', { recipientId: selectedUser.id });
      
      // Clear existing timeout
      if (typingTimeoutRef.current[selectedUser.id]) {
        clearTimeout(typingTimeoutRef.current[selectedUser.id]);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current[selectedUser.id] = setTimeout(() => {
        socket.emit('typing_stop', { recipientId: selectedUser.id });
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLastSeen = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="app-title">💬 ChatApp</h1>
          <form onSubmit={handleLogin}>
            <div className="input-group-custom">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-gradient w-100">
              <i className="bi bi-chat-dots me-2"></i>
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="container-fluid h-100">
        <div className="row h-100 justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="chat-card h-100">
              <div className="row h-100 g-0">
                {/* Users List */}
                <div className="col-12 col-md-4 user-list">
                  <div className="p-3 border-bottom border-light">
                    <div className="d-flex align-items-center">
                      <img 
                        src={currentUser?.avatar} 
                        alt="You" 
                        className="avatar-img me-3"
                      />
                      <div>
                        <h6 className="text-white mb-0">{currentUser?.username}</h6>
                        <small className="text-light">Online</small>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h6 className="text-white mb-3">
                      <i className="bi bi-people me-2"></i>
                      Online Users ({users.length})
                    </h6>
                    {users.length === 0 ? (
                      <p className="text-light text-center">No users online</p>
                    ) : (
                      users.map(user => (
                        <div
                          key={user.id}
                          className={`user-item p-3 ${selectedUser?.id === user.id ? 'active' : ''}`}
                          onClick={() => selectUser(user)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="position-relative">
                              <img 
                                src={user.avatar} 
                                alt={user.username} 
                                className="avatar-img me-3"
                              />
                              <span className={`position-absolute bottom-0 end-0 ${
                                user.status === 'online' ? 'online-indicator' : 'offline-indicator'
                              }`}></span>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="text-white mb-0">{user.username}</h6>
                              <small className="user-status text-light">
                                {user.status === 'online' ? 'Online' : `Last seen ${getLastSeen(user.lastSeen)}`}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="col-12 col-md-8 d-flex flex-column">
                  {selectedUser ? (
                    <>
                      {/* Chat Header */}
                      <div className="chat-header p-3">
                        <div className="d-flex align-items-center">
                          <div className="position-relative">
                            <img 
                              src={selectedUser.avatar} 
                              alt={selectedUser.username} 
                              className="avatar-img me-3"
                            />
                            <span className={`position-absolute bottom-0 end-0 ${
                              selectedUser.status === 'online' ? 'online-indicator' : 'offline-indicator'
                            }`}></span>
                          </div>
                          <div>
                            <h5 className="mb-0">{selectedUser.username}</h5>
                            <small className="text-light">
                              {selectedUser.status === 'online' ? 'Online' : `Last seen ${getLastSeen(selectedUser.lastSeen)}`}
                            </small>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-grow-1 p-3 message-container" style={{ overflowY: 'auto', height: '400px' }}>
                        {messages[selectedUser.id]?.length > 0 ? (
                          messages[selectedUser.id].map(message => (
                            <div key={message.id} className="d-flex">
                              <div className={`message-bubble ${
                                message.senderId === socket?.id ? 'message-sent' : 'message-received'
                              }`}>
                                <div>{message.message}</div>
                                <div className="message-time">
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-messages">
                            <i className="bi bi-chat-square-dots fs-1 text-muted"></i>
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        )}
                        
                        {/* Typing Indicator */}
                        {typingUsers[selectedUser.id] && (
                          <div className="typing-indicator">
                            <small>{typingUsers[selectedUser.id]} is typing</small>
                            <div className="typing-dots">
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                              <div className="typing-dot"></div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-3 border-top">
                        <form onSubmit={sendMessage}>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control message-input"
                              placeholder="Type your message..."
                              value={messageInput}
                              onChange={handleTyping}
                            />
                            <button type="submit" className="send-btn ms-2">
                              <i className="bi bi-send-fill"></i>
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <div className="text-center">
                        <i className="bi bi-chat-square-text fs-1 text-muted"></i>
                        <h4 className="text-muted mt-3">Select a user to start chatting</h4>
                        <p className="text-muted">Choose someone from the list to begin your conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
